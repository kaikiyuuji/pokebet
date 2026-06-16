<?php

namespace App\Http\Controllers;

use App\Actions\Battles\ApplyBattleRewardsAction;
use App\Actions\Battles\CreateBattleAction;
use App\Actions\Battles\SimulateBattleAction;
use App\Game\Battle\MoveSelector;
use App\Game\Battle\DamageCalculator;
use App\Models\Battle;
use App\Models\Pokemon;
use App\Models\PokemonType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BattleController extends Controller
{
    // ── GET /battle/new ──────────────────────────────────────────

    public function create(Request $request): Response
    {
        $query = Pokemon::with(['primaryType', 'secondaryType'])
            ->where('is_available', true)
            // Only show Pokémon that have at least 1 damage move imported
            ->whereHas('moves', fn($q) => $q->where('damage_class', '!=', 'status')->where('power', '>', 0))
            ->orderBy('pokeapi_id');

        if ($search = $request->input('search')) {
            $query->where('name', 'ilike', "%{$search}%");
        }

        if ($typeSlug = $request->input('type')) {
            $query->where(function ($q) use ($typeSlug) {
                $q->whereHas('primaryType', fn($t) => $t->where('slug', $typeSlug))
                  ->orWhereHas('secondaryType', fn($t) => $t->where('slug', $typeSlug));
            });
        }

        return Inertia::render('Battle/SelectPokemon', [
            'pokemons' => $query->paginate(48)->withQueryString()->through(
                fn($p) => $this->serializePokemon($p)
            ),
            'types'   => PokemonType::orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => $request->only(['search', 'type']),
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
            'pokemon_id' => ['required', 'integer', 'exists:pokemons,id'],
        ]);

        $pokemon = Pokemon::with('moves')->findOrFail($request->pokemon_id);

        if (!$moveSelector->canSelectFor($pokemon)) {
            return back()->withErrors([
                'pokemon_id' => 'Este Pokémon não tem golpes importados. Execute o importador primeiro.',
            ]);
        }

        $battle = $create->execute($request->user(), (int) $request->pokemon_id);
        $battle = $simulate->execute($battle);
        $rewards->execute($battle);

        return redirect()->route('battle.show', $battle->id);
    }

    // ── GET /battle/{battle} ─────────────────────────────────────

    public function show(Battle $battle, Request $request, DamageCalculator $calc): Response
    {
        if ($battle->user_id !== $request->user()->id) {
            abort(403);
        }

        $battle->load([
            'playerPokemon.primaryType',
            'playerPokemon.secondaryType',
            'opponentPokemon.primaryType',
            'opponentPokemon.secondaryType',
            'turns',
        ]);

        $playerMaxHp   = $calc->maxHp($battle->playerPokemon->base_hp, $battle->player_level);
        $opponentMaxHp = $calc->maxHp($battle->opponentPokemon->base_hp, $battle->opponent_level);

        return Inertia::render('Battle/Show', [
            'battle' => [
                'id'            => $battle->id,
                'result'        => $battle->result,
                'coins_awarded' => $battle->coins_awarded,
                'player' => [
                    'pokemon' => $this->serializePokemon($battle->playerPokemon),
                    'level'   => $battle->player_level,
                    'max_hp'  => $playerMaxHp,
                ],
                'opponent' => [
                    'pokemon' => $this->serializePokemon($battle->opponentPokemon),
                    'level'   => $battle->opponent_level,
                    'max_hp'  => $opponentMaxHp,
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

    private function serializePokemon(Pokemon $p): array
    {
        return [
            'id'                   => $p->id,
            'pokeapi_id'           => $p->pokeapi_id,
            'name'                 => $p->name,
            'slug'                 => $p->slug,
            'sprite'               => $p->sprite,
            'sprite_front'         => $p->sprite_front,
            'base_hp'              => $p->base_hp,
            'base_attack'          => $p->base_attack,
            'base_defense'         => $p->base_defense,
            'base_special_attack'  => $p->base_special_attack,
            'base_special_defense' => $p->base_special_defense,
            'base_speed'           => $p->base_speed,
            'base_total'           => $p->base_total,
            'primary_type'   => $p->primaryType  ? ['name' => $p->primaryType->name,  'slug' => $p->primaryType->slug]  : null,
            'secondary_type' => $p->secondaryType ? ['name' => $p->secondaryType->name, 'slug' => $p->secondaryType->slug] : null,
        ];
    }
}
