<?php

namespace App\Actions\Battles;

use App\Game\Battle\LevelGenerator;
use App\Game\Pokemon\PokemonData;
use App\Models\Battle;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateBattleAction
{
    public function __construct(
        private readonly LevelGenerator $levelGenerator,
    ) {}

    public function execute(User $user, PokemonData $player, PokemonData $opponent): Battle
    {
        $playerLevel   = $this->levelGenerator->generate();
        $opponentLevel = $this->levelGenerator->generateWithinDiff($playerLevel);

        return DB::transaction(function () use ($user, $player, $opponent, $playerLevel, $opponentLevel) {
            return Battle::create([
                'user_id'           => $user->id,
                'player_pokeapi_id' => $player->pokeapiId,
                'player_level'      => $playerLevel,
                'player_snapshot'   => $player->toSnapshot(),
                'opponent_pokeapi_id' => $opponent->pokeapiId,
                'opponent_level'    => $opponentLevel,
                'opponent_snapshot' => $opponent->toSnapshot(),
                'random_seed'       => bin2hex(random_bytes(16)),
            ]);
        });
    }
}
