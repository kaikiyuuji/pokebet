<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Battle extends Model
{
    protected $fillable = [
        'user_id',
        'player_pokemon_id',
        'player_level',
        'opponent_pokemon_id',
        'opponent_level',
        'result',
        'coins_awarded',
        'random_seed',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function playerPokemon(): BelongsTo
    {
        return $this->belongsTo(Pokemon::class, 'player_pokemon_id');
    }

    public function opponentPokemon(): BelongsTo
    {
        return $this->belongsTo(Pokemon::class, 'opponent_pokemon_id');
    }

    public function turns(): HasMany
    {
        return $this->hasMany(BattleTurn::class)->orderBy('turn_number');
    }
}
