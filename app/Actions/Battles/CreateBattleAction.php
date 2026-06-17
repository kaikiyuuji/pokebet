<?php

namespace App\Actions\Battles;

use App\Game\Battle\LevelGenerator;
use App\Game\Pokemon\PokeApiService;
use App\Game\Pokemon\PokemonData;
use App\Models\Battle;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateBattleAction
{
    public function __construct(
        private readonly LevelGenerator $levelGenerator,
        private readonly PokeApiService $pokeApi,
    ) {}

    public function execute(User $user, PokemonData $player, PokemonData $opponent, int $betAmount = 0): Battle
    {
        $playerInfo   = $this->pokeApi->getChainInfo($player->pokeapiId);
        $opponentInfo = $this->pokeApi->getChainInfo($opponent->pokeapiId);

        $playerScore       = $playerInfo['stage'] / $playerInfo['chain_length'];
        $opponentScore     = $opponentInfo['stage'] / $opponentInfo['chain_length'];
        $playerIsLegendary = $playerInfo['is_legendary'];

        $playerLevel   = $this->levelGenerator->generatePlayerLevel($playerIsLegendary);
        $opponentLevel = $this->levelGenerator->generateForOpponent(
            $playerLevel,
            $playerScore,
            $playerIsLegendary,
            $opponentScore,
        );

        return DB::transaction(function () use ($user, $player, $opponent, $playerLevel, $opponentLevel, $betAmount) {
            return Battle::create([
                'user_id'           => $user->id,
                'player_pokeapi_id' => $player->pokeapiId,
                'player_level'      => $playerLevel,
                'player_snapshot'   => $player->toSnapshot(),
                'opponent_pokeapi_id' => $opponent->pokeapiId,
                'opponent_level'    => $opponentLevel,
                'opponent_snapshot' => $opponent->toSnapshot(),
                'random_seed'       => bin2hex(random_bytes(16)),
                'bet_amount'        => $betAmount,
            ]);
        });
    }
}
