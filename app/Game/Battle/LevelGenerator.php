<?php

namespace App\Game\Battle;

class LevelGenerator
{
    private int $min;
    private int $max;
    private int $maxDiff;

    public function __construct()
    {
        $this->min     = (int) config('battle.min_level', 5);
        $this->max     = (int) config('battle.max_level', 100);
        $this->maxDiff = (int) config('battle.max_level_diff', 4);
    }

    public function generate(): int
    {
        return random_int($this->min, $this->max);
    }

    /** Generate a level within ±maxDiff of the given base, clamped to [min, max]. */
    public function generateWithinDiff(int $baseLevel): int
    {
        $lo = max($this->min, $baseLevel - $this->maxDiff);
        $hi = min($this->max, $baseLevel + $this->maxDiff);

        return random_int($lo, $hi);
    }
}
