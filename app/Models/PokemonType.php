<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PokemonType extends Model
{
    protected $fillable = ['name', 'slug'];

    public function primaryPokemons(): HasMany
    {
        return $this->hasMany(Pokemon::class, 'primary_type_id');
    }

    public function secondaryPokemons(): HasMany
    {
        return $this->hasMany(Pokemon::class, 'secondary_type_id');
    }

    public function moves(): HasMany
    {
        return $this->hasMany(Move::class, 'type_id');
    }
}
