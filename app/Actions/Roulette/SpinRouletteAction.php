<?php

namespace App\Actions\Roulette;

use App\Exceptions\RouletteCooldownException;
use App\Game\Roulette\RouletteWheel;
use App\Models\CoinTransaction;
use App\Models\RouletteSpin;
use App\Models\RouletteState;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SpinRouletteAction
{
    public function __construct(
        private readonly RouletteWheel $wheel,
    ) {}

    public function execute(User $authenticatedUser): array
    {
        return DB::transaction(function () use ($authenticatedUser) {
            $now = now();

            RouletteState::query()->insertOrIgnore([
                'user_id' => $authenticatedUser->id,
                'next_spin_at' => null,
                'bonus_spins' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $user = User::query()
                ->whereKey($authenticatedUser->id)
                ->lockForUpdate()
                ->firstOrFail();

            $state = RouletteState::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $usesBonusSpin = $state->bonus_spins > 0;

            if (! $usesBonusSpin && $state->next_spin_at?->isFuture()) {
                throw new RouletteCooldownException($state->next_spin_at);
            }

            if ($usesBonusSpin) {
                $state->decrement('bonus_spins');
                $state->refresh();
            } else {
                $state->next_spin_at = $now->copy()->addMinutes(
                    (int) config('roulette.cooldown_minutes', 60)
                );
            }

            $outcome = $this->wheel->draw();
            $coinsAwarded = $outcome['type'] === 'coins'
                ? (int) $outcome['coins']
                : 0;
            $awardsBonusSpin = $outcome['type'] === 'reroll';

            if ($coinsAwarded > 0) {
                $user->coins += $coinsAwarded;
                $user->save();
            }

            if ($awardsBonusSpin) {
                $state->bonus_spins += 1;
            }

            $state->save();

            $spin = RouletteSpin::create([
                'user_id' => $user->id,
                'outcome_key' => $outcome['key'],
                'outcome_type' => $outcome['type'],
                'coins_awarded' => $coinsAwarded,
                'weight' => $outcome['weight'],
                'used_bonus_spin' => $usesBonusSpin,
                'bonus_spin_awarded' => $awardsBonusSpin,
                'balance_after' => $user->coins,
            ]);

            if ($coinsAwarded > 0) {
                CoinTransaction::create([
                    'user_id' => $user->id,
                    'amount' => $coinsAwarded,
                    'balance_after' => $user->coins,
                    'type' => 'roulette_reward',
                    'reference_type' => RouletteSpin::class,
                    'reference_id' => $spin->id,
                    'description' => "Prêmio da roleta #{$spin->id}",
                ]);
            }

            return [
                'spin' => $spin,
                'outcome' => $outcome,
                'state' => $state->fresh(),
                'user' => $user->fresh(),
            ];
        }, 3);
    }
}
