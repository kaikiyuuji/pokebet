<?php

namespace App\Game\Battle;

use App\Models\Pokemon;
use App\Models\PokemonType;
use App\Models\TypeEffectiveness;

class EffectivenessCalculator
{
    /** [attacking_type_id][defending_type_id] => float */
    private array $chart = [];

    public function loadChart(): void
    {
        foreach (TypeEffectiveness::all() as $row) {
            $this->chart[$row->attacking_type_id][$row->defending_type_id] = (float) $row->multiplier;
        }
    }

    /**
     * Get the combined type multiplier for a move type attacking a defender.
     * Multiplies effectiveness against each of the defender's types.
     */
    public function calculate(PokemonType $moveType, Pokemon $defender): float
    {
        $multiplier = 1.0;

        $defenderTypes = array_filter([
            $defender->primaryType,
            $defender->secondaryType,
        ]);

        foreach ($defenderTypes as $defType) {
            $multiplier *= $this->chart[$moveType->id][$defType->id] ?? 1.0;
        }

        return $multiplier;
    }

    public function label(float $multiplier): string
    {
        return match (true) {
            $multiplier === 0.0  => 'immune',
            $multiplier < 1.0   => 'not-very-effective',
            $multiplier >= 4.0  => 'double-super-effective',
            $multiplier > 1.0   => 'super-effective',
            default              => 'normal',
        };
    }
}
