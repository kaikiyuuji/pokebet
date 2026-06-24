<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouletteSpin extends Model
{
    protected $fillable = [
        'user_id',
        'outcome_key',
        'outcome_type',
        'coins_awarded',
        'weight',
        'used_bonus_spin',
        'bonus_spin_awarded',
        'balance_after',
    ];

    protected function casts(): array
    {
        return [
            'coins_awarded' => 'integer',
            'weight' => 'integer',
            'used_bonus_spin' => 'boolean',
            'bonus_spin_awarded' => 'boolean',
            'balance_after' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
