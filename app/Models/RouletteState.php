<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouletteState extends Model
{
    protected $fillable = [
        'user_id',
        'next_spin_at',
        'bonus_spins',
    ];

    protected function casts(): array
    {
        return [
            'next_spin_at' => 'datetime',
            'bonus_spins' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
