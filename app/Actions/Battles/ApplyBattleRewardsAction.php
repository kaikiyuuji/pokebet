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
            $user = $battle->user;

            if ($battle->result === 'win') {
                $tier  = $this->rollLuckTier();
                $coins = $this->tierCoins($tier);

                $user->increment('coins', $coins);

                CoinTransaction::create([
                    'user_id'        => $user->id,
                    'amount'         => $coins,
                    'balance_after'  => $user->fresh()->coins,
                    'type'           => 'battle_reward',
                    'reference_type' => Battle::class,
                    'reference_id'   => $battle->id,
                    'description'    => "Vitória na batalha #{$battle->id} [{$tier}]",
                ]);

                $battle->update(['coins_awarded' => $coins, 'luck_tier' => $tier]);

            } elseif ($battle->result === 'loss') {
                $max     = (int) config('economy.loss_deduction_max', 50);
                $min     = (int) config('economy.loss_deduction_min', 20);
                $penalty = random_int($min, $max);
                $penalty = min($penalty, $user->coins);

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
                    'description'    => "Derrota na batalha #{$battle->id}",
                ]);

                $battle->update(['coins_awarded' => $penalty, 'luck_tier' => 'penalty']);

            } else {
                $coins = (int) config('economy.draw_reward', 10);

                $user->increment('coins', $coins);

                CoinTransaction::create([
                    'user_id'        => $user->id,
                    'amount'         => $coins,
                    'balance_after'  => $user->fresh()->coins,
                    'type'           => 'battle_reward',
                    'reference_type' => Battle::class,
                    'reference_id'   => $battle->id,
                    'description'    => "Empate na batalha #{$battle->id}",
                ]);

                $battle->update(['coins_awarded' => $coins, 'luck_tier' => 'draw']);
            }
        });

        return $battle->coins_awarded;
    }

    private function rollLuckTier(): string
    {
        $roll = random_int(1, 100);
        if ($roll <= 3)  return 'jackpot';
        if ($roll <= 15) return 'super_lucky';
        if ($roll <= 40) return 'lucky';
        return 'normal';
    }

    private function tierCoins(string $tier): int
    {
        return match ($tier) {
            'jackpot'     => random_int(401, 1000),
            'super_lucky' => random_int(201, 400),
            'lucky'       => random_int(101, 200),
            default       => random_int(50, 100),
        };
    }
}
