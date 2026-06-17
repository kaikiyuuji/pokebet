<?php

namespace App\Http\Controllers;

use App\Models\Battle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $totals = Battle::where('user_id', $user->id)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN result = 'win'  THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
                SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws
            ")
            ->first();

        $recentBattles = Battle::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(function (Battle $b) {
                $player   = $b->playerData();
                $opponent = $b->opponentData();

                return [
                    'id'            => $b->id,
                    'result'        => $b->result,
                    'coins_awarded' => $b->coins_awarded,
                    'bet_amount'    => $b->bet_amount,
                    'created_at'    => $b->created_at->format('d/m/Y H:i'),
                    'player'   => ['level' => $b->player_level,   'name' => $player->name,   'sprite' => $player->sprite],
                    'opponent' => ['level' => $b->opponent_level, 'name' => $opponent->name, 'sprite' => $opponent->sprite],
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'battles' => (int) $totals->total,
                'wins'    => (int) $totals->wins,
                'losses'  => (int) $totals->losses,
                'draws'   => (int) $totals->draws,
            ],
            'recentBattles' => $recentBattles,
        ]);
    }
}
