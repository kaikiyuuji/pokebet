<?php

namespace App\Http\Controllers;

use App\Game\Battle\DamageCalculator;
use App\Models\Battle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BattleHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $battles = $request->user()
            ->battles()
            ->with([
                'playerPokemon.primaryType',
                'playerPokemon.secondaryType',
                'opponentPokemon.primaryType',
                'opponentPokemon.secondaryType',
            ])
            ->latest()
            ->paginate(20);

        return Inertia::render('Battle/History', [
            'battles' => $battles->through(fn(Battle $b) => [
                'id'            => $b->id,
                'result'        => $b->result,
                'coins_awarded' => $b->coins_awarded,
                'created_at'    => $b->created_at->format('d/m/Y H:i'),
                'player' => [
                    'level'   => $b->player_level,
                    'pokemon' => [
                        'name'           => $b->playerPokemon->name,
                        'sprite'         => $b->playerPokemon->sprite,
                        'primary_type'   => $b->playerPokemon->primaryType
                            ? ['slug' => $b->playerPokemon->primaryType->slug, 'name' => $b->playerPokemon->primaryType->name]
                            : null,
                    ],
                ],
                'opponent' => [
                    'level'   => $b->opponent_level,
                    'pokemon' => [
                        'name'         => $b->opponentPokemon->name,
                        'sprite'       => $b->opponentPokemon->sprite,
                        'primary_type' => $b->opponentPokemon->primaryType
                            ? ['slug' => $b->opponentPokemon->primaryType->slug, 'name' => $b->opponentPokemon->primaryType->name]
                            : null,
                    ],
                ],
            ]),
        ]);
    }

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

        return Inertia::render('Battle/Log', [
            'battle' => [
                'id'            => $battle->id,
                'result'        => $battle->result,
                'coins_awarded' => $battle->coins_awarded,
                'created_at'    => $battle->created_at->format('d/m/Y H:i'),
                'random_seed'   => $battle->random_seed,
                'player' => [
                    'level'   => $battle->player_level,
                    'max_hp'  => $playerMaxHp,
                    'pokemon' => $this->serializePokemon($battle->playerPokemon),
                ],
                'opponent' => [
                    'level'   => $battle->opponent_level,
                    'max_hp'  => $opponentMaxHp,
                    'pokemon' => $this->serializePokemon($battle->opponentPokemon),
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
                    'damage_class'          => $t->metadata['damage_class'] ?? 'physical',
                    'effectiveness'         => $t->metadata['effectiveness'] ?? 'normal',
                    'stab'                  => $t->metadata['stab'] ?? false,
                ]),
            ],
        ]);
    }

    private function serializePokemon(\App\Models\Pokemon $p): array
    {
        return [
            'id'                   => $p->id,
            'pokeapi_id'           => $p->pokeapi_id,
            'name'                 => $p->name,
            'sprite'               => $p->sprite,
            'base_hp'              => $p->base_hp,
            'base_attack'          => $p->base_attack,
            'base_defense'         => $p->base_defense,
            'base_special_attack'  => $p->base_special_attack,
            'base_special_defense' => $p->base_special_defense,
            'base_speed'           => $p->base_speed,
            'base_total'           => $p->base_total,
            'primary_type'   => $p->primaryType
                ? ['name' => $p->primaryType->name,  'slug' => $p->primaryType->slug]
                : null,
            'secondary_type' => $p->secondaryType
                ? ['name' => $p->secondaryType->name, 'slug' => $p->secondaryType->slug]
                : null,
        ];
    }
}
