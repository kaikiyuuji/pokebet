<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pokemon extends Model
{
    protected $fillable = [
        'pokeapi_id',
        'name',
        'slug',
        'primary_type_id',
        'secondary_type_id',
        'base_hp',
        'base_attack',
        'base_defense',
        'base_special_attack',
        'base_special_defense',
        'base_speed',
        'sprite_front',
        'sprite_official',
        'sprite_home',
        'price',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function primaryType(): BelongsTo
    {
        return $this->belongsTo(PokemonType::class, 'primary_type_id');
    }

    public function secondaryType(): BelongsTo
    {
        return $this->belongsTo(PokemonType::class, 'secondary_type_id');
    }

    public function moves(): BelongsToMany
    {
        return $this->belongsToMany(Move::class, 'pokemon_moves');
    }

    public function owners(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_pokemons');
    }

    public function getSpritAttribute(): string
    {
        return $this->sprite_official
            ?? $this->sprite_home
            ?? $this->sprite_front
            ?? config('pokeapi.image_fallback');
    }
}
