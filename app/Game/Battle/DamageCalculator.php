<?php

namespace App\Game\Battle;

use App\Game\Pokemon\MoveData;
use App\Game\Pokemon\PokemonData;

class DamageCalculator
{
    public function __construct(
        private readonly EffectivenessCalculator $effectiveness,
    ) {}

    /**
     * HP = floor((2 * base * level) / 100) + level + 10  (Gen III+ formula, no IVs/EVs)
     */
    public function maxHp(int $baseHp, int $level): int
    {
        return (int) floor((2 * $baseHp * $level) / 100) + $level + 10;
    }

    /**
     * Returns [damage, isCritical, typeMultiplier].
     * Caller must mt_srand() before the battle loop.
     */
    public function calculate(PokemonData $attacker, int $level, MoveData $move, PokemonData $defender): array
    {
        if (!$move->isDamaging()) {
            return [0, false, 1.0];
        }

        $atkStat = $move->damageClass === 'special'
            ? $attacker->baseSpecialAttack
            : $attacker->baseAttack;

        $defStat = $move->damageClass === 'special'
            ? $defender->baseSpecialDefense
            : $defender->baseDefense;

        $base = (int) floor(((2 * $level / 5 + 2) * $move->power * ($atkStat / max(1, $defStat))) / 50 + 2);

        $typeMultiplier = $this->effectiveness->calculate($move->typeSlug, $defender);

        $stab = ($move->typeSlug === $attacker->primaryTypeSlug
            || $move->typeSlug === $attacker->secondaryTypeSlug)
            ? 1.5 : 1.0;

        $critChance    = (float) config('battle.critical_chance', 0.0625);
        $critMult      = (float) config('battle.critical_multiplier', 1.5);
        $isCritical    = (mt_rand() / mt_getrandmax()) < $critChance;
        $crit          = $isCritical ? $critMult : 1.0;

        $randMin = (float) config('battle.random_damage_min', 0.85);
        $randMax = (float) config('battle.random_damage_max', 1.00);
        $random  = $randMin + (mt_rand() / mt_getrandmax()) * ($randMax - $randMin);

        $damage = max(1, (int) floor($base * $typeMultiplier * $stab * $crit * $random));

        return [$damage, $isCritical, $typeMultiplier];
    }
}
