<?php

namespace App\Game\Battle;

use App\Game\Pokemon\MoveData;
use App\Game\Pokemon\PokemonData;

class BattleSimulator
{
    private const MAX_ROUNDS = 50;

    public function __construct(
        private readonly DamageCalculator       $damage,
        private readonly EffectivenessCalculator $effectiveness,
    ) {}

    /**
     * @param MoveData[] $playerMoves
     * @param MoveData[] $opponentMoves
     */
    public function simulate(
        PokemonData $player,
        int         $playerLevel,
        array       $playerMoves,
        PokemonData $opponent,
        int         $opponentLevel,
        array       $opponentMoves,
        string      $seed,
    ): array {
        mt_srand(crc32($seed));

        $this->effectiveness->loadChart();

        $playerMaxHp   = $this->damage->maxHp($player->baseHp, $playerLevel);
        $opponentMaxHp = $this->damage->maxHp($opponent->baseHp, $opponentLevel);

        $playerHp   = $playerMaxHp;
        $opponentHp = $opponentMaxHp;

        $turns = [];

        for ($round = 1; $round <= self::MAX_ROUNDS; $round++) {
            $playerFirst = $player->baseSpeed > $opponent->baseSpeed
                || ($player->baseSpeed === $opponent->baseSpeed && mt_rand(0, 1) === 0);

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

                $move = $atkMoves[mt_rand(0, count($atkMoves) - 1)];

                [$dmg, $isCritical, $typeMultiplier] = $this->damage->calculate($atk, $atkLevel, $move, $def);

                if ($side === 'player') {
                    $opponentHp = max(0, $opponentHp - $dmg);
                } else {
                    $playerHp = max(0, $playerHp - $dmg);
                }

                $turns[] = [
                    'turn_number'           => count($turns) + 1,
                    'attacker'              => $side,
                    'damage_dealt'          => $dmg,
                    'is_critical'           => $isCritical,
                    'type_multiplier'       => $typeMultiplier,
                    'player_hp_remaining'   => $playerHp,
                    'opponent_hp_remaining' => $opponentHp,
                    'metadata'              => [
                        'move_name'     => $move->name,
                        'move_type'     => $move->typeSlug,
                        'damage_class'  => $move->damageClass,
                        'stab'          => $move->typeSlug === $atk->primaryTypeSlug
                                           || $move->typeSlug === $atk->secondaryTypeSlug,
                        'effectiveness' => $this->effectiveness->label($typeMultiplier),
                    ],
                ];
            }
        }

        if ($playerHp <= 0 && $opponentHp <= 0) {
            $result = 'draw';
        } elseif ($playerHp <= 0) {
            $result = 'loss';
        } elseif ($opponentHp <= 0) {
            $result = 'win';
        } else {
            $playerPct   = $playerHp / $playerMaxHp;
            $opponentPct = $opponentHp / $opponentMaxHp;
            $result = $playerPct > $opponentPct ? 'win' : ($playerPct < $opponentPct ? 'loss' : 'draw');
        }

        return compact('turns', 'result', 'playerMaxHp', 'opponentMaxHp', 'playerHp', 'opponentHp');
    }
}
