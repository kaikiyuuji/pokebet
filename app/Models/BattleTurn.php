<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BattleTurn extends Model
{
    protected $fillable = [
        'battle_id',
        'turn_number',
        'attacker',
        'damage_dealt',
        'is_critical',
        'type_multiplier',
        'player_hp_remaining',
        'opponent_hp_remaining',
        'metadata',
    ];

    protected $casts = [
        'is_critical' => 'boolean',
        'metadata'    => 'array',
    ];

    public function battle(): BelongsTo
    {
        return $this->belongsTo(Battle::class);
    }
}
