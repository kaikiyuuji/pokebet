<?php

namespace App\Models;

use App\Game\Pokemon\PokemonData;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Battle extends Model
{
    protected $fillable = [
        'user_id',
        'player_pokeapi_id',
        'player_level',
        'player_snapshot',
        'opponent_pokeapi_id',
        'opponent_level',
        'opponent_snapshot',
        'result',
        'coins_awarded',
        'random_seed',
    ];

    protected $casts = [
        'player_snapshot'   => 'array',
        'opponent_snapshot' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function turns(): HasMany
    {
        return $this->hasMany(BattleTurn::class)->orderBy('turn_number');
    }

    public function playerData(): PokemonData
    {
        return PokemonData::fromSnapshot($this->player_snapshot);
    }

    public function opponentData(): PokemonData
    {
        return PokemonData::fromSnapshot($this->opponent_snapshot);
    }
}
