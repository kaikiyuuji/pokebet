<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TypeEffectiveness extends Model
{
    protected $table = 'type_effectiveness';

    protected $fillable = [
        'attacking_type_id',
        'defending_type_id',
        'multiplier',
    ];

    protected $casts = [
        'multiplier' => 'float',
    ];

    public function attackingType(): BelongsTo
    {
        return $this->belongsTo(PokemonType::class, 'attacking_type_id');
    }

    public function defendingType(): BelongsTo
    {
        return $this->belongsTo(PokemonType::class, 'defending_type_id');
    }
}
