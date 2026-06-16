<?php

namespace App\Game\Battle;

use App\Models\Move;
use App\Models\Pokemon;
use Illuminate\Support\Collection;

class MoveSelector
{
    /**
     * Select {count} moves for a Pokémon's battle moveset.
     * Guarantees at least 1 damage move (physical or special with power > 0).
     */
    public function selectForBattle(Pokemon $pokemon, int $count = 2): Collection
    {
        // Moves must already be loaded (with 'type' relation)
        $all = $pokemon->moves;

        if ($all->isEmpty()) {
            return collect();
        }

        $damage = $all->filter(fn(Move $m) => $m->isDamaging());
        $status = $all->filter(fn(Move $m) => !$m->isDamaging());

        $selected = collect();

        // Guarantee at least 1 damage move
        if ($damage->isNotEmpty()) {
            $pick = $damage->values()->get(mt_rand(0, $damage->count() - 1));
            $selected->push($pick);
        }

        // Fill remaining slots from all moves not yet selected
        $pool = $all->reject(fn(Move $m) => $selected->pluck('id')->contains($m->id))->values();

        while ($selected->count() < $count && $pool->isNotEmpty()) {
            $idx  = mt_rand(0, $pool->count() - 1);
            $pick = $pool->get($idx);
            $selected->push($pick);
            $pool = $pool->reject(fn(Move $m) => $m->id === $pick->id)->values();
        }

        return $selected;
    }

    public function canSelectFor(Pokemon $pokemon): bool
    {
        return $pokemon->moves()->where('damage_class', '!=', 'status')
            ->where('power', '>', 0)
            ->exists();
    }
}
