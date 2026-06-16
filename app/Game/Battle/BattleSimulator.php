<?php

namespace App\Game\Battle;

use App\Models\Move;
use App\Models\Pokemon;
use Illuminate\Support\Collection;

class BattleSimulator
{
    private const MAX_ROUNDS = 50;

    public function __construct(
        private readonly DamageCalculator      $damage,
        private readonly EffectivenessCalculator $effectiveness,
    ) {}

    /**
     * Run a full battle simulation. Returns a result array with turns and outcome.
     * Caller must pass moves with 'type' relation already loaded.
     * Uses mt_rand seeded by the battle's random_seed for reproducibility.
     */
    public function simulate(
        Pokemon $player,
        int $playerLevel,
        Collection $playerMoves,
        Pokemon $opponent,
        int $opponentLevel,
        Collection $opponentMoves,
        string $seed,
    ): array {
        mt_srand(crc32($seed));

        $this->effectiveness->loadChart();

        $playerMaxHp   = $this->damage->maxHp($player->base_hp, $playerLevel);
        $opponentMaxHp = $this->damage->maxHp($opponent->base_hp, $opponentLevel);

        $playerHp   = $playerMaxHp;
        $opponentHp = $opponentMaxHp;

        $turns = [];

        for ($round = 1; $round <= self::MAX_ROUNDS; $round++) {
            // Determine attack order by base Speed (random on tie)
            $playerFirst = $player->base_speed > $opponent->base_speed
                || ($player->base_speed === $opponent->base_speed && mt_rand(0, 1) === 0);

            $order = $playerFirst
                ? [['side' => 'player'], ['side' => 'opponent']]
                : [['side' => 'opponent'], ['side' => 'player']];

            foreach ($order as $slot) {
                if ($playerHp <= 0 || $opponentHp <= 0) {
                    break 2;
                }

                $side = $slot['side'];

                [$atk, $atkLevel, $atkMoves, $def] = $side === 'player'
                    ? [$player, $playerLevel, $playerMoves, $opponent]
                    : [$opponent, $opponentLevel, $opponentMoves, $player];

                // Seeded random move selection
                $move = $atkMoves->values()->get(mt_rand(0, $atkMoves->count() - 1));

                [$dmg, $isCritical, $typeMultiplier] = $this->damage->calculate($atk, $atkLevel, $move, $def);

                if ($side === 'player') {
                    $opponentHp = max(0, $opponentHp - $dmg);
                } else {
                    $playerHp = max(0, $playerHp - $dmg);
                }

                $turns[] = [
                    'turn_number'           => count($turns) + 1,
                    'attacker'              => $side,
                    'move_id'               => $move->id,
                    'damage_dealt'          => $dmg,
                    'is_critical'           => $isCritical,
                    'type_multiplier'       => $typeMultiplier,
                    'player_hp_remaining'   => $playerHp,
                    'opponent_hp_remaining' => $opponentHp,
                    'metadata'              => [
                        'move_name'      => $move->name,
                        'move_type'      => $move->type->slug ?? 'normal',
                        'damage_class'   => $move->damage_class,
                        'stab'           => $move->type_id === $atk->primary_type_id
                                            || $move->type_id === $atk->secondary_type_id,
                        'effectiveness'  => $this->effectiveness->label($typeMultiplier),
                    ],
                ];
            }
        }

        // Determine result
        if ($playerHp <= 0 && $opponentHp <= 0) {
            $result = 'draw';
        } elseif ($playerHp <= 0) {
            $result = 'loss';
        } elseif ($opponentHp <= 0) {
            $result = 'win';
        } else {
            // Max rounds reached: compare remaining HP percentage
            $playerPct   = $playerHp / $playerMaxHp;
            $opponentPct = $opponentHp / $opponentMaxHp;
            $result = $playerPct > $opponentPct ? 'win' : ($playerPct < $opponentPct ? 'loss' : 'draw');
        }

        return compact('turns', 'result', 'playerMaxHp', 'opponentMaxHp', 'playerHp', 'opponentHp');
    }
}
