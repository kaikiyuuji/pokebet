<?php

namespace App\Http\Controllers;

use App\Actions\Battles\ApplyBattleRewardsAction;
use App\Actions\Battles\CreateBattleAction;
use App\Actions\Battles\SimulateBattleAction;
use App\Game\Battle\DamageCalculator;
use App\Game\Battle\MoveSelector;
use App\Game\Pokemon\PokeApiService;
use App\Game\Pokemon\PokemonData;
use App\Models\Battle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BattleController extends Controller
{
    public function __construct(
        private readonly PokeApiService $pokeApi,
    ) {}

    // ── GET /battle/new ──────────────────────────────────────────

    public function create(Request $request): Response
    {
        $page   = max(1, (int) $request->input('page', 1));
        $search = trim((string) $request->input('search', ''));

        $browse = $this->pokeApi->browse($page, 48, $search);

        return Inertia::render('Battle/SelectPokemon', [
            'pokemons' => [
                'data'         => $browse['data'],
                'total'        => $browse['total'],
                'current_page' => $browse['page'],
                'last_page'    => $browse['lastPage'],
                'links'        => $this->buildPageLinks($browse['page'], $browse['lastPage'], $search),
            ],
            'types'   => [],
            'filters' => $request->only(['search']),
        ]);
    }

    // ── POST /battle ─────────────────────────────────────────────

    public function store(
        Request $request,
        CreateBattleAction $create,
        SimulateBattleAction $simulate,
        ApplyBattleRewardsAction $rewards,
        MoveSelector $moveSelector,
    ): RedirectResponse {
        $request->validate([
            'pokeapi_id'          => ['required', 'integer', 'min:1', 'max:10000'],
            'opponent_pokeapi_id' => ['nullable', 'integer', 'min:1', 'max:10000', 'different:pokeapi_id'],
            'bet_amount'          => ['required', 'integer', 'min:10'],
        ]);

        $betAmount         = (int) $request->bet_amount;
        $user              = $request->user();
        $pokeapiId         = (int) $request->pokeapi_id;
        $opponentPokeapiId = $request->filled('opponent_pokeapi_id')
            ? (int) $request->opponent_pokeapi_id
            : null;

        if ($betAmount > $user->coins) {
            return back()->withErrors(['bet_amount' => 'Saldo insuficiente para esta aposta.']);
        }

        $player   = $this->pokeApi->fetchForBattle($pokeapiId);
        $opponent = $opponentPokeapiId
            ? $this->pokeApi->fetchForBattle($opponentPokeapiId)
            : $this->pickBattleOpponent($pokeapiId, $moveSelector);

        if (!$moveSelector->hasDamagingMove($player->moves)) {
            return back()->withErrors([
                'pokeapi_id' => 'Este Pokémon não tem golpes de ataque disponíveis. Tente outro.',
            ]);
        }

        if (!$moveSelector->hasDamagingMove($opponent->moves)) {
            $opponent = $this->pickBattleOpponent($pokeapiId, $moveSelector);
        }

        $battle = $create->execute($user, $player, $opponent, $betAmount);
        $battle = $simulate->execute($battle, $player, $opponent);
        $rewards->execute($battle);

        return redirect()->route('battle.show', $battle->id);
    }

    public function opponent(Request $request, MoveSelector $moveSelector): JsonResponse
    {
        $request->validate([
            'pokeapi_id' => ['required', 'integer', 'min:1', 'max:10000'],
        ]);

        $opponent = $this->pickBattleOpponent((int) $request->pokeapi_id, $moveSelector);

        return response()->json([
            'opponent' => $this->serializePokemon($opponent),
        ]);
    }

    // ── GET /battle/{battle} ─────────────────────────────────────

    public function show(Battle $battle, Request $request, DamageCalculator $calc): Response
    {
        if ($battle->user_id !== $request->user()->id) {
            abort(403);
        }

        $battle->load(['turns']);

        $player   = $battle->playerData();
        $opponent = $battle->opponentData();

        return Inertia::render('Battle/Show', [
            'battle' => [
                'id'            => $battle->id,
                'result'        => $battle->result,
                'coins_awarded' => $battle->coins_awarded,
                'luck_tier'     => $battle->luck_tier,
                'player' => [
                    'pokemon' => $this->serializePokemon($player),
                    'level'   => $battle->player_level,
                    'max_hp'  => $calc->maxHp($player->baseHp, $battle->player_level),
                ],
                'opponent' => [
                    'pokemon' => $this->serializePokemon($opponent),
                    'level'   => $battle->opponent_level,
                    'max_hp'  => $calc->maxHp($opponent->baseHp, $battle->opponent_level),
                ],
                'turns' => $battle->turns->map(fn($t) => [
                    'turn_number'           => $t->turn_number,
                    'attacker'              => $t->attacker,
                    'damage_dealt'          => $t->damage_dealt,
                    'is_critical'           => $t->is_critical,
                    'type_multiplier'       => (float) $t->type_multiplier,
                    'player_hp_remaining'   => $t->player_hp_remaining,
                    'opponent_hp_remaining' => $t->opponent_hp_remaining,
                    'move_name'             => $t->metadata['move_name'] ?? '?',
                    'move_type'             => $t->metadata['move_type'] ?? 'normal',
                    'effectiveness'         => $t->metadata['effectiveness'] ?? 'normal',
                    'stab'                  => $t->metadata['stab'] ?? false,
                ]),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────

    private function serializePokemon(PokemonData $p): array
    {
        return [
            'id'                   => $p->pokeapiId,
            'pokeapi_id'           => $p->pokeapiId,
            'name'                 => $p->name,
            'slug'                 => $p->slug,
            'sprite'               => $p->sprite,
            'sprite_front'         => $p->sprite,
            'base_hp'              => $p->baseHp,
            'base_attack'          => $p->baseAttack,
            'base_defense'         => $p->baseDefense,
            'base_special_attack'  => $p->baseSpecialAttack,
            'base_special_defense' => $p->baseSpecialDefense,
            'base_speed'           => $p->baseSpeed,
            'base_total'           => $p->baseTotal(),
            'primary_type'   => ['name' => $p->primaryTypeName,  'slug' => $p->primaryTypeSlug],
            'secondary_type' => $p->secondaryTypeSlug
                ? ['name' => $p->secondaryTypeName, 'slug' => $p->secondaryTypeSlug]
                : null,
        ];
    }

    private function pickBattleOpponent(int $excludePokeapiId, MoveSelector $moveSelector): PokemonData
    {
        $opponent = null;

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $opponent = $this->pokeApi->randomOpponent($excludePokeapiId);

            if ($moveSelector->hasDamagingMove($opponent->moves)) {
                return $opponent;
            }
        }

        return $opponent ?? $this->pokeApi->randomOpponent($excludePokeapiId);
    }

    private function buildPageLinks(int $current, int $lastPage, string $search): array
    {
        $url = function (int $p) use ($search): string {
            $params = array_filter(['page' => $p > 1 ? $p : null, 'search' => $search ?: null]);
            return route('battle.new', $params);
        };

        $links = [['url' => $current > 1 ? $url($current - 1) : null, 'label' => '&laquo; Anterior', 'active' => false]];

        $from = max(1, $current - 3);
        $to   = min($lastPage, $current + 3);

        for ($i = $from; $i <= $to; $i++) {
            $links[] = ['url' => $url($i), 'label' => (string) $i, 'active' => $i === $current];
        }

        $links[] = ['url' => $current < $lastPage ? $url($current + 1) : null, 'label' => 'Próximo &raquo;', 'active' => false];

        return $links;
    }
}
