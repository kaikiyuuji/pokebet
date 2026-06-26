<?php

namespace App\Http\Controllers;

use App\Actions\Roulette\SpinRouletteAction;
use App\Exceptions\RouletteCooldownException;
use App\Game\Roulette\RouletteWheel;
use App\Models\RouletteSpin;
use App\Models\RouletteState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RouletteController extends Controller
{
    public function index(Request $request, RouletteWheel $wheel): Response
    {
        $state = RouletteState::query()
            ->where('user_id', $request->user()->id)
            ->first();

        return Inertia::render('Roulette/Index', [
            'segments' => $wheel->publicSegments(),
            'roulette' => $this->serializeState($state),
            'recentSpins' => RouletteSpin::query()
                ->where('user_id', $request->user()->id)
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (RouletteSpin $spin) => [
                    'id' => $spin->id,
                    'outcome_type' => $spin->outcome_type,
                    'coins_awarded' => $spin->coins_awarded,
                    'bonus_spin_awarded' => $spin->bonus_spin_awarded,
                    'created_at' => $spin->created_at->format('d/m/Y H:i'),
                ]),
        ]);
    }

    public function spin(Request $request, SpinRouletteAction $spinRoulette): JsonResponse
    {
        try {
            $result = $spinRoulette->execute($request->user());
        } catch (RouletteCooldownException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'next_spin_at' => $exception->nextSpinAt->format(DATE_ATOM),
            ], 429);
        }

        $state = $result['state'];
        $outcome = $result['outcome'];

        return response()->json([
            'spin_id' => $result['spin']->id,
            'outcome' => [
                'key' => $outcome['key'],
                'type' => $outcome['type'],
                'label' => $outcome['label'],
                'coins' => $result['spin']->coins_awarded,
            ],
            'balance' => $result['user']->coins,
            'roulette' => $this->serializeState($state),
        ]);
    }

    private function serializeState(?RouletteState $state): array
    {
        $bonusSpins = $state?->bonus_spins ?? 0;
        $nextSpinAt = $state?->next_spin_at;
        $canSpin = $bonusSpins > 0 || ! $nextSpinAt || $nextSpinAt->isPast();

        return [
            'can_spin' => $canSpin,
            'bonus_spins' => $bonusSpins,
            'next_spin_at' => $nextSpinAt?->format(DATE_ATOM),
            'cooldown_minutes' => (int) config('roulette.cooldown_minutes', 60),
        ];
    }
}
