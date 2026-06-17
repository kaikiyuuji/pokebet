<?php

namespace App\Game\Pokemon;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PokeApiService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('pokeapi.base_url', 'https://pokeapi.co/api/v2'), '/');
    }

    /**
     * Fetch a Pokémon ready for battle (with moves). Cached 7 days.
     */
    public function fetchForBattle(int $pokeapiId): PokemonData
    {
        $data = Cache::remember(
            "pokeapi.battle.raw.{$pokeapiId}",
            86400 * 7,
            fn() => $this->fetch("/pokemon/{$pokeapiId}")
        );

        return $this->buildPokemonData($data);
    }

    /**
     * Return chain info for balancing. Cached 7 days.
     *
     * Returns:
     *   stage        – position in the evo chain (1 = base, 2 = mid, 3 = final)
     *   chain_length – max depth of the full evo chain (1 = standalone, 2 or 3)
     *   is_legendary – true for legendary / mythical
     *
     * "Completeness score" = stage / chain_length:
     *   Lapras  (1/1 = 1.0)  == Charizard (3/3 = 1.0)  → equal
     *   Ivysaur (2/3 ≈ 0.67) != Raticate  (2/2 = 1.0)  → Raticate is fully evolved
     */
    public function getChainInfo(int $pokeapiId): array
    {
        return Cache::remember(
            "pokeapi.chaininfo.{$pokeapiId}",
            86400 * 7,
            function () use ($pokeapiId) {
                try {
                    $species     = $this->fetchSpecies($pokeapiId);
                    $slug        = $species['name'];
                    $isLegendary = (bool) ($species['is_legendary'] ?? false)
                                || (bool) ($species['is_mythical'] ?? false);

                    $chainUrl    = $species['evolution_chain']['url'];
                    $chain       = $this->fetchEvolutionChain($chainUrl);
                    $root        = $chain['chain'];

                    $stage       = $this->findStageInChain($root, $slug) ?? 1;
                    $chainLength = $this->chainMaxDepth($root);

                    return ['stage' => $stage, 'chain_length' => $chainLength, 'is_legendary' => $isLegendary];
                } catch (\Exception) {
                    return ['stage' => 1, 'chain_length' => 1, 'is_legendary' => false];
                }
            }
        );
    }

    /**
     * Pick a random Pokémon (different from given ID) for use as battle opponent.
     */
    public function randomOpponent(int $excludePokeapiId, int $maxId = 151): PokemonData
    {
        $attempts = 0;
        do {
            $id = random_int(1, $maxId);
            $attempts++;
        } while ($id === $excludePokeapiId && $attempts < 10);

        return $this->fetchForBattle($id);
    }

    /**
     * Paginated browse list — only name + sprite, no stats (1 API call total, cached 24h).
     */
    public function browse(int $page = 1, int $perPage = 48, string $search = ''): array
    {
        $all = Cache::remember('pokeapi.browse.gen1', 86400, function () {
            $response = Http::timeout(15)->get("{$this->baseUrl}/pokemon?limit=151");
            if ($response->failed()) {
                return [];
            }
            return collect($response->json()['results'])
                ->map(function ($item) {
                    preg_match('/\/(\d+)\/$/', $item['url'], $m);
                    $id = (int) ($m[1] ?? 0);
                    return [
                        'id'             => $id,
                        'pokeapi_id'     => $id,
                        'name'           => $this->formatName($item['name']),
                        'slug'           => $item['name'],
                        'sprite'         => "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{$id}.png",
                        'sprite_front'   => "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{$id}.png",
                        'primary_type'   => null,
                        'secondary_type' => null,
                        'base_total'     => null,
                    ];
                })
                ->filter(fn($p) => $p['id'] > 0)
                ->values()
                ->all();
        });

        if ($search !== '') {
            $all = array_values(
                array_filter($all, fn($p) =>
                    str_contains(mb_strtolower($p['name']), mb_strtolower($search))
                )
            );
        }

        $total    = count($all);
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page     = min($page, $lastPage);
        $data     = array_slice($all, ($page - 1) * $perPage, $perPage);

        return compact('data', 'total', 'lastPage', 'page');
    }

    // ──────────────────────────────────────────────────

    private function fetchSpecies(int $pokeapiId): array
    {
        return Cache::remember(
            "pokeapi.species.{$pokeapiId}",
            86400 * 7,
            fn() => $this->fetch("/pokemon-species/{$pokeapiId}")
        );
    }

    private function fetchEvolutionChain(string $url): array
    {
        return Cache::remember(
            'pokeapi.evochain.' . md5($url),
            86400 * 7,
            fn() => $this->fetch($url)
        );
    }

    /** Recursively find the depth (1-based stage) of $slug in the chain tree. */
    private function findStageInChain(array $node, string $slug, int $depth = 1): ?int
    {
        if ($node['species']['name'] === $slug) {
            return $depth;
        }
        foreach ($node['evolves_to'] as $child) {
            $result = $this->findStageInChain($child, $slug, $depth + 1);
            if ($result !== null) {
                return $result;
            }
        }
        return null;
    }

    /** Return the max depth (chain length) of the evo tree. */
    private function chainMaxDepth(array $node, int $depth = 1): int
    {
        if (empty($node['evolves_to'])) {
            return $depth;
        }
        return max(array_map(
            fn($child) => $this->chainMaxDepth($child, $depth + 1),
            $node['evolves_to']
        ));
    }

    private function buildPokemonData(array $data): PokemonData
    {
        $stats   = collect($data['stats'])->keyBy(fn($s) => $s['stat']['name']);
        $sprites = $data['sprites'] ?? [];
        $other   = $sprites['other'] ?? [];

        $primaryTypeSlug   = collect($data['types'])->firstWhere('slot', 1)['type']['name'] ?? 'normal';
        $secondaryTypeSlug = collect($data['types'])->firstWhere('slot', 2)['type']['name'] ?? null;

        $sprite = $other['official-artwork']['front_default']
            ?? $other['home']['front_default']
            ?? $sprites['front_default']
            ?? config('pokeapi.image_fallback');

        $moveSlugs = collect($data['moves'])->pluck('move.name')->take(12)->all();
        $moves     = $this->fetchMoves($moveSlugs);

        return new PokemonData(
            pokeapiId:           $data['id'],
            name:                $this->formatName($data['name']),
            slug:                $data['name'],
            sprite:              $sprite,
            baseHp:              $stats->get('hp')['base_stat'] ?? 45,
            baseAttack:          $stats->get('attack')['base_stat'] ?? 45,
            baseDefense:         $stats->get('defense')['base_stat'] ?? 45,
            baseSpecialAttack:   $stats->get('special-attack')['base_stat'] ?? 45,
            baseSpecialDefense:  $stats->get('special-defense')['base_stat'] ?? 45,
            baseSpeed:           $stats->get('speed')['base_stat'] ?? 45,
            primaryTypeSlug:     $primaryTypeSlug,
            secondaryTypeSlug:   $secondaryTypeSlug,
            primaryTypeName:     ucfirst($primaryTypeSlug),
            secondaryTypeName:   $secondaryTypeSlug ? ucfirst($secondaryTypeSlug) : null,
            moves:               $moves,
        );
    }

    /**
     * Fetch move details for a list of slugs (cached 7 days each).
     */
    private function fetchMoves(array $slugs): array
    {
        $moves = [];

        foreach ($slugs as $slug) {
            try {
                $moveData = Cache::remember("pokeapi.move.{$slug}", 86400 * 7, fn() => $this->fetch("/move/{$slug}"));

                $damageClass = $moveData['damage_class']['name'] ?? null;
                if (!in_array($damageClass, ['physical', 'special', 'status'])) {
                    continue;
                }

                $moves[] = new MoveData(
                    name:        ucwords(str_replace('-', ' ', $moveData['name'])),
                    slug:        $moveData['name'],
                    typeSlug:    $moveData['type']['name'] ?? 'normal',
                    damageClass: $damageClass,
                    power:       $moveData['power'],
                    accuracy:    $moveData['accuracy'],
                    pp:          max(1, (int) ($moveData['pp'] ?? 5)),
                );
            } catch (\Exception) {
                continue;
            }
        }

        return $moves;
    }

    private function fetch(string $endpoint): array
    {
        $url      = Str::startsWith($endpoint, 'http') ? $endpoint : $this->baseUrl . $endpoint;
        $response = Http::timeout(30)->retry(2, 500)->get($url);

        if ($response->failed()) {
            throw new \RuntimeException("PokéAPI [{$response->status()}]: {$url}");
        }

        return $response->json();
    }

    private function formatName(string $slug): string
    {
        return collect(explode('-', $slug))
            ->map(fn($part) => ucfirst($part))
            ->implode(' ');
    }
}
