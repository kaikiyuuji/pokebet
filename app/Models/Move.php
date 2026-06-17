<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Move extends Model
{
    protected $fillable = [
        'pokeapi_id',
        'name',
        'slug',
        'type_id',
        'damage_class',
        'power',
        'accuracy',
        'pp',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(PokemonType::class, 'type_id');
    }

    public function pokemons(): BelongsToMany
    {
        return $this->belongsToMany(Pokemon::class, 'pokemon_moves');
    }

    public function isDamaging(): bool
    {
        return $this->damage_class !== 'status' && $this->power > 0;
    }
}
