<?php

namespace App\Game\Battle;

use App\Game\Pokemon\MoveData;

class MoveSelector
{
    /**
     * Select {count} moves for battle. Guarantees at least 1 damaging move.
     *
     * @param  MoveData[] $moves
     * @return MoveData[]
     */
    public function selectForBattle(array $moves, int $count = 2): array
    {
        if (empty($moves)) {
            return [];
        }

        $damage   = array_values(array_filter($moves, fn(MoveData $m) => $m->isDamaging()));
        $selected = [];

        if (!empty($damage)) {
            $selected[] = $damage[mt_rand(0, count($damage) - 1)];
        }

        $selectedSlugs = array_column(array_map(fn($m) => ['slug' => $m->slug], $selected), 'slug');
        $pool = array_values(array_filter($moves, fn(MoveData $m) => !in_array($m->slug, $selectedSlugs)));

        while (count($selected) < $count && !empty($pool)) {
            $idx  = mt_rand(0, count($pool) - 1);
            $pick = $pool[$idx];
            $selected[]    = $pick;
            $pool = array_values(array_filter($pool, fn(MoveData $m) => $m->slug !== $pick->slug));
        }

        return $selected;
    }

    /** @param MoveData[] $moves */
    public function hasDamagingMove(array $moves): bool
    {
        return !empty(array_filter($moves, fn(MoveData $m) => $m->isDamaging()));
    }
}
