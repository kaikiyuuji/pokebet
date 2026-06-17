<?php

namespace App\Actions\Battles;

use App\Game\Battle\BattleSimulator;
use App\Game\Battle\MoveSelector;
use App\Game\Pokemon\PokemonData;
use App\Models\Battle;
use App\Models\BattleTurn;
use Illuminate\Support\Facades\DB;

class SimulateBattleAction
{
    public function __construct(
        private readonly BattleSimulator $simulator,
        private readonly MoveSelector    $moveSelector,
    ) {}

    public function execute(Battle $battle, PokemonData $player, PokemonData $opponent): Battle
    {
        $playerMoves   = $this->moveSelector->selectForBattle($player->moves);
        $opponentMoves = $this->moveSelector->selectForBattle($opponent->moves);

        $result = $this->simulator->simulate(
            player:        $player,
            playerLevel:   $battle->player_level,
            playerMoves:   $playerMoves,
            opponent:      $opponent,
            opponentLevel: $battle->opponent_level,
            opponentMoves: $opponentMoves,
            seed:          $battle->random_seed,
        );

        DB::transaction(function () use ($battle, $result) {
            $now      = now();
            $turnRows = array_map(fn(array $t) => [
                'battle_id'             => $battle->id,
                'turn_number'           => $t['turn_number'],
                'attacker'              => $t['attacker'],
                'damage_dealt'          => $t['damage_dealt'],
                'is_critical'           => $t['is_critical'],
                'type_multiplier'       => $t['type_multiplier'],
                'player_hp_remaining'   => $t['player_hp_remaining'],
                'opponent_hp_remaining' => $t['opponent_hp_remaining'],
                'metadata'              => json_encode($t['metadata']),
                'created_at'            => $now,
                'updated_at'            => $now,
            ], $result['turns']);

            BattleTurn::insert($turnRows);
            $battle->update(['result' => $result['result']]);
        });

        $battle->player_max_hp   = $result['playerMaxHp'];
        $battle->opponent_max_hp = $result['opponentMaxHp'];

        return $battle->fresh(['turns']);
    }
}
