<?php

return [
    'max_level_diff'       => (int) env('BATTLE_MAX_LEVEL_DIFF', 4),
    'min_level'            => (int) env('BATTLE_MIN_LEVEL', 5),
    'max_level'            => (int) env('BATTLE_MAX_LEVEL', 100),
    'critical_chance'      => (float) env('BATTLE_CRITICAL_CHANCE', 0.0625),
    'critical_multiplier'  => (float) env('BATTLE_CRITICAL_MULTIPLIER', 1.5),
    'random_damage_min'    => (float) env('BATTLE_RANDOM_DAMAGE_MIN', 0.85),
    'random_damage_max'    => (float) env('BATTLE_RANDOM_DAMAGE_MAX', 1.00),
];
