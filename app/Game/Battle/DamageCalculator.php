<?php

namespace App\Game\Battle;

use App\Models\Move;
use App\Models\Pokemon;

class DamageCalculator
{
    public function __construct(
        private readonly EffectivenessCalculator $effectiveness,
    ) {}

    /**
     * Calculate max HP using the Gen III+ formula (no IVs/EVs).
     * HP = floor((2 * base * level) / 100) + level + 10
     */
    public function maxHp(int $baseHp, int $level): int
    {
        return (int) floor((2 * $baseHp * $level) / 100) + $level + 10;
    }

    /**
     * Returns [damage, isCritical, typeMultiplier].
     * Uses seeded mt_rand — caller must mt_srand() before the battle.
     *
     * Formula: floor(((2*L/5+2) * Power * Atk/Def) / 50 + 2) * modifiers
     */
    public function calculate(Pokemon $attacker, int $level, Move $move, Pokemon $defender): array
    {
        if (!$move->isDamaging()) {
            return [0, false, 1.0];
        }

        $power = $move->power;

        $atkStat = $move->damage_class === 'special'
            ? $attacker->base_special_attack
            : $attacker->base_attack;

        $defStat = $move->damage_class === 'special'
            ? $defender->base_special_defense
            : $defender->base_defense;

        // Base damage
        $base = (int) floor(((2 * $level / 5 + 2) * $power * ($atkStat / max(1, $defStat))) / 50 + 2);

        // Type effectiveness
        $typeMultiplier = $this->effectiveness->calculate($move->type, $defender);

        // STAB (Same Type Attack Bonus)
        $stab = ($move->type_id === $attacker->primary_type_id
            || $move->type_id === $attacker->secondary_type_id)
            ? 1.5
            : 1.0;

        // Critical hit (uses seeded mt_rand)
        $critChance      = (float) config('battle.critical_chance', 0.0625);
        $critMultiplier  = (float) config('battle.critical_multiplier', 1.5);
        $isCritical      = (mt_rand() / mt_getrandmax()) < $critChance;
        $crit            = $isCritical ? $critMultiplier : 1.0;

        // Random damage factor
        $randMin = (float) config('battle.random_damage_min', 0.85);
        $randMax = (float) config('battle.random_damage_max', 1.00);
        $random  = $randMin + (mt_rand() / mt_getrandmax()) * ($randMax - $randMin);

        $damage = max(1, (int) floor($base * $typeMultiplier * $stab * $crit * $random));

        return [$damage, $isCritical, $typeMultiplier];
    }
}
