<?php

namespace App\Game\Pokemon;

use App\Models\Move;
use App\Models\Pokemon;
use App\Models\PokemonType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PokemonImporter
{
    private string $baseUrl;
    private int $delayMs;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('pokeapi.base_url', 'https://pokeapi.co/api/v2'), '/');
        $this->delayMs = (int) config('pokeapi.delay_ms', 150);
    }

    public function importAll(int $limit = 2000, ?callable $progress = null): void
    {
        $this->importTypes($progress);
        $this->importMoves($limit, $progress);
        $this->importPokemon($limit, $progress);
    }

    // ──────────────────────────────────────────────────
    // Types + Effectiveness
    // ──────────────────────────────────────────────────

    public function importTypes(?callable $progress = null): void
    {
        $this->log($progress, '⏳ Importando tipos...');

        $list = $this->fetch('/type?limit=100');

        $validTypes = [];
        foreach ($list['results'] as $result) {
            $detail = $this->fetch('/type/' . $result['name']);

            // PokéAPI has 'unknown' and 'shadow' as non-standard types
            if (in_array($detail['name'], ['shadow', 'unknown'])) {
                continue;
            }

            PokemonType::updateOrCreate(
                ['slug' => $detail['name']],
                ['name' => ucfirst($detail['name'])]
            );

            $validTypes[] = $detail['name'];
            $this->log($progress, "  Tipo: {$detail['name']}");
        }

        $this->log($progress, '⏳ Importando efetividade de tipos...');

        $types = PokemonType::all()->keyBy('slug');

        foreach ($types as $attackingSlug => $attackingType) {
            $detail = $this->fetch('/type/' . $attackingSlug);
            $relations = $detail['damage_relations'];

            $chart = [];
            foreach ($relations['double_damage_to'] as $t) {
                $chart[$t['name']] = 2.0;
            }
            foreach ($relations['half_damage_to'] as $t) {
                $chart[$t['name']] = 0.5;
            }
            foreach ($relations['no_damage_to'] as $t) {
                $chart[$t['name']] = 0.0;
            }

            $rows = [];
            $now = now();
            foreach ($types as $defendingSlug => $defendingType) {
                $rows[] = [
                    'attacking_type_id' => $attackingType->id,
                    'defending_type_id' => $defendingType->id,
                    'multiplier'        => $chart[$defendingSlug] ?? 1.0,
                    'created_at'        => $now,
                    'updated_at'        => $now,
                ];
            }

            // Upsert the whole row at once
            DB::table('type_effectiveness')->upsert(
                $rows,
                ['attacking_type_id', 'defending_type_id'],
                ['multiplier', 'updated_at']
            );

            $this->log($progress, "  Efetividade de: {$attackingSlug}");
        }

        $this->log($progress, '✅ Tipos importados.');
    }

    // ──────────────────────────────────────────────────
    // Moves
    // ──────────────────────────────────────────────────

    public function importMoves(int $limit = 2000, ?callable $progress = null): void
    {
        $this->log($progress, "⏳ Importando golpes (limite: {$limit})...");

        $list = $this->fetch("/move?limit={$limit}");
        $results = $list['results'];
        $total = count($results);

        $typesMap = PokemonType::all()->keyBy('slug');
        $imported = 0;
        $skipped = 0;

        foreach ($results as $i => $item) {
            $detail = $this->fetch('/move/' . $item['name']);

            $typeSlug = $detail['type']['name'] ?? null;
            $type = $typeSlug ? $typesMap->get($typeSlug) : null;

            // Skip moves with invalid/missing type
            if (!$type) {
                $skipped++;
                continue;
            }

            $damageClass = $detail['damage_class']['name'] ?? null;
            if (!in_array($damageClass, ['physical', 'special', 'status'])) {
                $skipped++;
                continue;
            }

            $pp = $detail['pp'] ?? 5;
            if ($pp <= 0) {
                $pp = 5;
            }

            Move::updateOrCreate(
                ['slug' => $detail['name']],
                [
                    'pokeapi_id'   => $detail['id'],
                    'name'         => ucwords(str_replace('-', ' ', $detail['name'])),
                    'type_id'      => $type->id,
                    'damage_class' => $damageClass,
                    'power'        => $detail['power'],   // nullable for status
                    'accuracy'     => $detail['accuracy'], // nullable for some moves
                    'pp'           => $pp,
                ]
            );

            $imported++;

            if (($i + 1) % 100 === 0) {
                $this->log($progress, "  Golpes: " . ($i + 1) . "/{$total} (importados: {$imported}, ignorados: {$skipped})");
            }
        }

        $this->log($progress, "✅ Golpes importados: {$imported} | ignorados: {$skipped}");
    }

    // ──────────────────────────────────────────────────
    // Pokémon
    // ──────────────────────────────────────────────────

    public function importPokemon(int $limit = 2000, ?callable $progress = null): void
    {
        $this->log($progress, "⏳ Importando Pokémon (limite: {$limit})...");

        $list = $this->fetch("/pokemon?limit={$limit}");
        $results = $list['results'];
        $total = count($results);

        // Cache types and moves in memory to avoid repeated queries
        $typesMap = PokemonType::all()->keyBy('slug');
        $movesMap = Move::all()->keyBy('slug');

        $imported = 0;
        $skipped = 0;

        foreach ($results as $i => $item) {
            try {
                $detail = $this->fetch('/pokemon/' . $item['name']);

                $primaryTypeSlug = collect($detail['types'])
                    ->firstWhere('slot', 1)['type']['name'] ?? null;

                $secondaryTypeSlug = collect($detail['types'])
                    ->firstWhere('slot', 2)['type']['name'] ?? null;

                $primaryType = $primaryTypeSlug ? $typesMap->get($primaryTypeSlug) : null;

                if (!$primaryType) {
                    $skipped++;
                    continue;
                }

                $stats = collect($detail['stats'])->keyBy(fn($s) => $s['stat']['name']);

                $sprites = $detail['sprites'] ?? [];
                $other   = $sprites['other'] ?? [];

                $totalBaseStats = array_sum(array_column($detail['stats'], 'base_stat'));
                $price = $this->calculatePrice($totalBaseStats);

                $pokemon = Pokemon::updateOrCreate(
                    ['slug' => $detail['name']],
                    [
                        'pokeapi_id'           => $detail['id'],
                        'name'                 => $this->formatName($detail['name']),
                        'primary_type_id'      => $primaryType->id,
                        'secondary_type_id'    => $secondaryTypeSlug ? $typesMap->get($secondaryTypeSlug)?->id : null,
                        'base_hp'              => $stats->get('hp')['base_stat'] ?? 45,
                        'base_attack'          => $stats->get('attack')['base_stat'] ?? 45,
                        'base_defense'         => $stats->get('defense')['base_stat'] ?? 45,
                        'base_special_attack'  => $stats->get('special-attack')['base_stat'] ?? 45,
                        'base_special_defense' => $stats->get('special-defense')['base_stat'] ?? 45,
                        'base_speed'           => $stats->get('speed')['base_stat'] ?? 45,
                        'sprite_front'         => $sprites['front_default'] ?? null,
                        'sprite_official'      => $other['official-artwork']['front_default'] ?? null,
                        'sprite_home'          => $other['home']['front_default'] ?? null,
                        'price'                => $price,
                        'is_available'         => true,
                    ]
                );

                // Link only moves that are already in our DB
                $moveIds = collect($detail['moves'])
                    ->map(fn($m) => $m['move']['name'])
                    ->filter(fn($name) => $movesMap->has($name))
                    ->map(fn($name) => $movesMap->get($name)->id)
                    ->unique()
                    ->values()
                    ->all();

                $pokemon->moves()->sync($moveIds);

                $imported++;
            } catch (\Exception $e) {
                $skipped++;
                Log::warning("PokemonImporter: falhou ao importar {$item['name']}", [
                    'error' => $e->getMessage(),
                ]);
            }

            if (($i + 1) % 50 === 0 || $i + 1 === $total) {
                $this->log($progress, "  Pokémon: " . ($i + 1) . "/{$total} (importados: {$imported})");
            }
        }

        $this->log($progress, "✅ Pokémon importados: {$imported} | ignorados: {$skipped}");
    }

    // ──────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────

    private function fetch(string $endpoint): array
    {
        $url = Str::startsWith($endpoint, 'http') ? $endpoint : $this->baseUrl . $endpoint;

        $response = Http::timeout(30)
            ->retry(3, 1000, fn($e) => !($e instanceof \Illuminate\Http\Client\ConnectionException))
            ->get($url);

        if ($response->failed()) {
            throw new \RuntimeException("PokéAPI error [{$response->status()}]: {$url}");
        }

        // Respect the configured delay between requests
        usleep($this->delayMs * 1000);

        return $response->json();
    }

    private function calculatePrice(int $totalBaseStats): int
    {
        // Tier by total base stats (max is ~780 for legendaries)
        return match (true) {
            $totalBaseStats >= 600 => 2000,
            $totalBaseStats >= 500 => 1000,
            $totalBaseStats >= 400 => 600,
            $totalBaseStats >= 300 => 300,
            default                => 150,
        };
    }

    private function formatName(string $slug): string
    {
        // Handle special names like "nidoran-f", "mr-mime", "ho-oh"
        return collect(explode('-', $slug))
            ->map(fn($part) => ucfirst($part))
            ->implode(' ');
    }

    private function log(?callable $progress, string $message): void
    {
        if ($progress) {
            $progress($message);
        }
    }
}
