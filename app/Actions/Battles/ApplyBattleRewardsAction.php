<?php

namespace App\Actions\Battles;

use App\Models\Battle;
use App\Models\CoinTransaction;
use Illuminate\Support\Facades\DB;

class ApplyBattleRewardsAction
{
    public function execute(Battle $battle): int
    {
        if ($battle->coins_awarded > 0) {
            return $battle->coins_awarded; // already applied
        }

        $coins = match ($battle->result) {
            'win'  => random_int(
                (int) config('economy.win_reward_min', 50),
                (int) config('economy.win_reward_max', 150)
            ),
            'draw' => (int) round(config('economy.loss_reward', 10) * 2),
            default => (int) config('economy.loss_reward', 10),
        };

        DB::transaction(function () use ($battle, $coins) {
            $user = $battle->user;

            $user->increment('coins', $coins);

            CoinTransaction::create([
                'user_id'        => $user->id,
                'amount'         => $coins,
                'balance_after'  => $user->coins,
                'type'           => 'battle_reward',
                'reference_type' => Battle::class,
                'reference_id'   => $battle->id,
                'description'    => match ($battle->result) {
                    'win'   => "Vitória na batalha #{$battle->id}",
                    'draw'  => "Empate na batalha #{$battle->id}",
                    default => "Derrota na batalha #{$battle->id}",
                },
            ]);

            $battle->update(['coins_awarded' => $coins]);
        });

        return $coins;
    }
}
