<?php

return [
    'cooldown_minutes' => 60,

    /*
    |--------------------------------------------------------------------------
    | Weighted outcomes
    |--------------------------------------------------------------------------
    |
    | Weights use a 1,000,000 point scale so very rare prizes can be
    | represented without floating-point arithmetic.
    |
    */
    'outcomes' => [
        [
            'key' => 'nothing',
            'type' => 'nothing',
            'label' => 'Nada',
            'coins' => 0,
            'weight' => 50_000,
        ],
        [
            'key' => 'coins_10',
            'type' => 'coins',
            'label' => '10 moedas',
            'coins' => 10,
            'weight' => 280_000,
        ],
        [
            'key' => 'coins_25',
            'type' => 'coins',
            'label' => '25 moedas',
            'coins' => 25,
            'weight' => 250_000,
        ],
        [
            'key' => 'coins_50',
            'type' => 'coins',
            'label' => '50 moedas',
            'coins' => 50,
            'weight' => 200_000,
        ],
        [
            'key' => 'coins_100',
            'type' => 'coins',
            'label' => '100 moedas',
            'coins' => 100,
            'weight' => 120_000,
        ],
        [
            'key' => 'coins_250',
            'type' => 'coins',
            'label' => '250 moedas',
            'coins' => 250,
            'weight' => 60_000,
        ],
        [
            'key' => 'reroll',
            'type' => 'reroll',
            'label' => 'Gire novamente',
            'coins' => 0,
            'weight' => 30_000,
        ],
        [
            'key' => 'coins_1000',
            'type' => 'coins',
            'label' => '1.000 moedas',
            'coins' => 1_000,
            'weight' => 8_000,
        ],
        [
            'key' => 'coins_5000',
            'type' => 'coins',
            'label' => '5.000 moedas',
            'coins' => 5_000,
            'weight' => 1_900,
        ],
        [
            'key' => 'coins_25000',
            'type' => 'coins',
            'label' => '25.000 moedas',
            'coins' => 25_000,
            'weight' => 100,
        ],
    ],
];
