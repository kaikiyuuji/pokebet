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

    /**
     * Player-side level generation. Legendaries are capped at 50 so their
     * inflated base stats don't trivialise the battle — opponent will always
     * be significantly higher level (see generateForOpponent legendary branch).
     */
    public function generatePlayerLevel(bool $isLegendary): int
    {
        $max = $isLegendary ? 50 : $this->max;
        return random_int($this->min, $max);
    }

    /** Generate a level within ±maxDiff of the given base, clamped to [min, max]. */
    public function generateWithinDiff(int $baseLevel): int
    {
        $lo = max($this->min, $baseLevel - $this->maxDiff);
        $hi = min($this->max, $baseLevel + $this->maxDiff);

        return random_int($lo, $hi);
    }

    /**
     * Generate opponent level with evolutionary-completeness balancing.
     *
     * "Completeness score" = stage / chain_length (0 < score ≤ 1.0).
     * Examples:
     *   Lapras   1/1 = 1.00  (standalone = fully complete)
     *   Charizard 3/3 = 1.00  (final evo of 3-stage chain)
     *   Raticate  2/2 = 1.00  (final evo of 2-stage chain)
     *   Ivysaur   2/3 ≈ 0.67 (mid evo of 3-stage chain)
     *   Pidgeotto 2/3 ≈ 0.67 (mid evo of 3-stage chain)
     *   Bulbasaur 1/3 ≈ 0.33 (base of 3-stage chain)
     *   Pidgey    1/3 ≈ 0.33 (base of 3-stage chain)
     *   Eevee     1/2 = 0.50 (base of 2-stage chain)
     *
     * Boost ∝ (playerScore − opponentScore), randomised within a ±4-level spread.
     * Legendary player always pushes opponent to 75–100.
     */
    public function generateForOpponent(
        int   $playerLevel,
        float $playerScore,
        bool  $playerIsLegendary,
        float $opponentScore,
    ): int {
        if ($playerIsLegendary) {
            $boost = random_int(25, 40);
            $lo    = min($this->max, max($this->min, max(75, $playerLevel + $boost)));
            return random_int($lo, $this->max);
        }

        $diff = $playerScore - $opponentScore;

        if ($diff <= 0.0) {
            return $this->generateWithinDiff($playerLevel);
        }

        // diff 0.33 → base ~15  (e.g. stage-3 vs mid-evo of 3-stage)
        // diff 0.50 → base ~22  (e.g. final-evo vs base of 2-stage)
        // diff 0.67 → base ~30  (e.g. stage-3 vs base of 3-stage)
        $base   = (int) round($diff * 45);
        $spread = random_int(-4, 4);
        $boost  = max(1, $base + $spread);

        $lo = min($this->max, max($this->min, $playerLevel + $boost));
        $hi = min($this->max, $lo + $this->maxDiff);

        return random_int($lo, $hi);
    }
}
