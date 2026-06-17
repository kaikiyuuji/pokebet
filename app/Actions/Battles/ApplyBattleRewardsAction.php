<?php

namespace App\Actions\Battles;

use App\Models\Battle;
use App\Models\CoinTransaction;
use Illuminate\Support\Facades\DB;

class ApplyBattleRewardsAction
{
    public function execute(Battle $battle): int
    {
        if ($battle->luck_tier !== null) {
            return $battle->coins_awarded;
        }

        DB::transaction(function () use ($battle) {
            $user      = $battle->user;
            $betAmount = (int) $battle->bet_amount;

            if ($battle->result === 'win') {
                $profit = (int) floor($betAmount * 0.8);

                $user->increment('coins', $profit);

                CoinTransaction::create([
                    'user_id'        => $user->id,
                    'amount'         => $profit,
                    'balance_after'  => $user->fresh()->coins,
                    'type'           => 'battle_reward',
                    'reference_type' => Battle::class,
                    'reference_id'   => $battle->id,
                    'description'    => "Vitória na batalha #{$battle->id} (aposta: {$betAmount})",
                ]);

                $battle->update(['coins_awarded' => $profit, 'luck_tier' => 'win']);

            } elseif ($battle->result === 'loss') {
                $penalty = min($betAmount, $user->coins);

                if ($penalty > 0) {
                    $user->decrement('coins', $penalty);
                }

                CoinTransaction::create([
                    'user_id'        => $user->id,
                    'amount'         => -$penalty,
                    'balance_after'  => $user->fresh()->coins,
                    'type'           => 'battle_penalty',
                    'reference_type' => Battle::class,
                    'reference_id'   => $battle->id,
                    'description'    => "Derrota na batalha #{$battle->id} (aposta: {$betAmount})",
                ]);

                $battle->update(['coins_awarded' => $penalty, 'luck_tier' => 'loss']);

            } else {
                $battle->update(['coins_awarded' => 0, 'luck_tier' => 'draw']);
            }
        });

        return $battle->fresh()->coins_awarded;
    }
}
