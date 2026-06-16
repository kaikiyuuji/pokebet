<?php

namespace App\Http\Controllers;

use App\Actions\Battles\CreateBattleAction;
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

    public function store(Request $request, CreateBattleAction $action): RedirectResponse
    {
        $request->validate([
            'pokemon_id' => ['required', 'integer', 'exists:pokemons,id'],
        ]);

        $battle = $action->execute($request->user(), (int) $request->pokemon_id);

        return redirect()->route('battle.show', $battle->id);
    }

    // ── GET /battle/{battle} ─────────────────────────────────────

    public function show(Battle $battle, Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        if ($battle->user_id !== $request->user()->id) {
            abort(403);
        }

        $battle->load([
            'playerPokemon.primaryType',
            'playerPokemon.secondaryType',
            'opponentPokemon.primaryType',
            'opponentPokemon.secondaryType',
        ]);

        return Inertia::render('Battle/Show', [
            'battle' => [
                'id'     => $battle->id,
                'result' => $battle->result,
                'player' => [
                    'pokemon' => $this->serializePokemon($battle->playerPokemon),
                    'level'   => $battle->player_level,
                ],
                'opponent' => [
                    'pokemon' => $this->serializePokemon($battle->opponentPokemon),
                    'level'   => $battle->opponent_level,
                ],
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────

    private function serializePokemon(Pokemon $p): array
    {
        return [
            'id'             => $p->id,
            'pokeapi_id'     => $p->pokeapi_id,
            'name'           => $p->name,
            'slug'           => $p->slug,
            'sprite'         => $p->sprite,
            'sprite_front'   => $p->sprite_front,
            'base_hp'        => $p->base_hp,
            'base_attack'    => $p->base_attack,
            'base_defense'   => $p->base_defense,
            'base_special_attack'  => $p->base_special_attack,
            'base_special_defense' => $p->base_special_defense,
            'base_speed'     => $p->base_speed,
            'base_total'     => $p->base_total,
            'primary_type'   => $p->primaryType  ? ['name' => $p->primaryType->name,  'slug' => $p->primaryType->slug]  : null,
            'secondary_type' => $p->secondaryType ? ['name' => $p->secondaryType->name, 'slug' => $p->secondaryType->slug] : null,
        ];
    }
}
