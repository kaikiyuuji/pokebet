<?php

namespace App\Game\Roulette;

use RuntimeException;

class RouletteWheel
{
    public function draw(): array
    {
        $outcomes = $this->outcomes();
        $totalWeight = array_sum(array_column($outcomes, 'weight'));
        $roll = random_int(1, $totalWeight);
        $cursor = 0;

        foreach ($outcomes as $outcome) {
            $cursor += $outcome['weight'];

            if ($roll <= $cursor) {
                return $outcome;
            }
        }

        throw new RuntimeException('Não foi possível selecionar um resultado da roleta.');
    }

    public function publicSegments(): array
    {
        $outcomes = $this->outcomes();
        $totalWeight = array_sum(array_column($outcomes, 'weight'));

        return array_map(fn (array $outcome) => [
            'key' => $outcome['key'],
            'type' => $outcome['type'],
            'label' => $outcome['label'],
            'coins' => $outcome['coins'],
            'chance' => round(($outcome['weight'] / $totalWeight) * 100, 4),
        ], $outcomes);
    }

    private function outcomes(): array
    {
        $outcomes = config('roulette.outcomes', []);

        if ($outcomes === []) {
            throw new RuntimeException('A roleta não possui resultados configurados.');
        }

        foreach ($outcomes as $outcome) {
            if (
                ! isset($outcome['key'], $outcome['type'], $outcome['label'], $outcome['coins'], $outcome['weight'])
                || ! is_int($outcome['weight'])
                || $outcome['weight'] <= 0
            ) {
                throw new RuntimeException('A configuração da roleta é inválida.');
            }
        }

        return array_values($outcomes);
    }
}
