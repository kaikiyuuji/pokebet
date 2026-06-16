<?php

namespace App\Actions\Battles;

use App\Game\Battle\BattleSimulator;
use App\Game\Battle\MoveSelector;
use App\Models\Battle;
use App\Models\BattleTurn;
use Illuminate\Support\Facades\DB;

class SimulateBattleAction
{
    public function __construct(
        private readonly BattleSimulator $simulator,
        private readonly MoveSelector    $moveSelector,
    ) {}

    public function execute(Battle $battle): Battle
    {
        // Eager-load everything the simulator needs
        $battle->load([
            'playerPokemon.primaryType',
            'playerPokemon.secondaryType',
            'playerPokemon.moves.type',
            'opponentPokemon.primaryType',
            'opponentPokemon.secondaryType',
            'opponentPokemon.moves.type',
        ]);

        $playerMoves   = $this->moveSelector->selectForBattle($battle->playerPokemon);
        $opponentMoves = $this->moveSelector->selectForBattle($battle->opponentPokemon);

        $result = $this->simulator->simulate(
            player:        $battle->playerPokemon,
            playerLevel:   $battle->player_level,
            playerMoves:   $playerMoves,
            opponent:      $battle->opponentPokemon,
            opponentLevel: $battle->opponent_level,
            opponentMoves: $opponentMoves,
            seed:          $battle->random_seed,
        );

        DB::transaction(function () use ($battle, $result) {
            // Save all turns
            $turnRows = array_map(
                fn(array $t) => array_merge($t, [
                    'battle_id'  => $battle->id,
                    'metadata'   => json_encode($t['metadata']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]),
                $result['turns']
            );

            BattleTurn::insert($turnRows);

            $battle->update(['result' => $result['result']]);
        });

        // Store max HPs on the model instance so the controller can pass them to the view
        $battle->player_max_hp   = $result['playerMaxHp'];
        $battle->opponent_max_hp = $result['opponentMaxHp'];

        return $battle->fresh(['turns.move']);
    }
}
