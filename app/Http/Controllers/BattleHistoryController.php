<?php

namespace App\Http\Controllers;

use App\Game\Battle\DamageCalculator;
use App\Game\Pokemon\PokemonData;
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
            ->latest()
            ->paginate(20);

        return Inertia::render('Battle/History', [
            'battles' => $battles->through(fn(Battle $b) => [
                'id'            => $b->id,
                'result'        => $b->result,
                'coins_awarded' => $b->coins_awarded,
                'luck_tier'     => $b->luck_tier,
                'created_at'    => $b->created_at->format('d/m/Y H:i'),
                'player' => [
                    'level'   => $b->player_level,
                    'pokemon' => $this->miniSerialize($b->playerData()),
                ],
                'opponent' => [
                    'level'   => $b->opponent_level,
                    'pokemon' => $this->miniSerialize($b->opponentData()),
                ],
            ]),
        ]);
    }

    public function show(Battle $battle, Request $request, DamageCalculator $calc): Response
    {
        if ($battle->user_id !== $request->user()->id) {
            abort(403);
        }

        $battle->load(['turns']);

        $player   = $battle->playerData();
        $opponent = $battle->opponentData();

        return Inertia::render('Battle/Log', [
            'battle' => [
                'id'            => $battle->id,
                'result'        => $battle->result,
                'coins_awarded' => $battle->coins_awarded,
                'created_at'    => $battle->created_at->format('d/m/Y H:i'),
                'random_seed'   => $battle->random_seed,
                'player' => [
                    'level'   => $battle->player_level,
                    'max_hp'  => $calc->maxHp($player->baseHp, $battle->player_level),
                    'pokemon' => $this->fullSerialize($player),
                ],
                'opponent' => [
                    'level'   => $battle->opponent_level,
                    'max_hp'  => $calc->maxHp($opponent->baseHp, $battle->opponent_level),
                    'pokemon' => $this->fullSerialize($opponent),
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

    private function miniSerialize(PokemonData $p): array
    {
        return [
            'name'         => $p->name,
            'sprite'       => $p->sprite,
            'primary_type' => ['slug' => $p->primaryTypeSlug, 'name' => $p->primaryTypeName],
        ];
    }

    private function fullSerialize(PokemonData $p): array
    {
        return [
            'id'                   => $p->pokeapiId,
            'pokeapi_id'           => $p->pokeapiId,
            'name'                 => $p->name,
            'sprite'               => $p->sprite,
            'base_hp'              => $p->baseHp,
            'base_attack'          => $p->baseAttack,
            'base_defense'         => $p->baseDefense,
            'base_special_attack'  => $p->baseSpecialAttack,
            'base_special_defense' => $p->baseSpecialDefense,
            'base_speed'           => $p->baseSpeed,
            'base_total'           => $p->baseTotal(),
            'primary_type'   => ['name' => $p->primaryTypeName, 'slug' => $p->primaryTypeSlug],
            'secondary_type' => $p->secondaryTypeSlug
                ? ['name' => $p->secondaryTypeName, 'slug' => $p->secondaryTypeSlug]
                : null,
        ];
    }
}
