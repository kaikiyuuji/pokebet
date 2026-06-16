<?php

namespace App\Actions\Battles;

use App\Game\Battle\LevelGenerator;
use App\Models\Battle;
use App\Models\Pokemon;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateBattleAction
{
    public function __construct(
        private readonly LevelGenerator $levelGenerator,
    ) {}

    public function execute(User $user, int $playerPokemonId): Battle
    {
        $playerPokemon = Pokemon::findOrFail($playerPokemonId);

        $playerLevel   = $this->levelGenerator->generate();
        $opponentLevel = $this->levelGenerator->generateWithinDiff($playerLevel);

        // Random opponent — different Pokémon from the player's choice
        $opponent = Pokemon::where('id', '!=', $playerPokemonId)
            ->where('is_available', true)
            ->inRandomOrder()
            ->firstOrFail();

        return DB::transaction(function () use ($user, $playerPokemon, $playerLevel, $opponent, $opponentLevel) {
            return Battle::create([
                'user_id'             => $user->id,
                'player_pokemon_id'   => $playerPokemon->id,
                'player_level'        => $playerLevel,
                'opponent_pokemon_id' => $opponent->id,
                'opponent_level'      => $opponentLevel,
                'random_seed'         => bin2hex(random_bytes(16)),
            ]);
        });
    }
}
