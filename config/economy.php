<?php

return [
    'starting_coins'     => (int) env('ECONOMY_STARTING_COINS', 1000),
    'win_reward_min'     => (int) env('ECONOMY_WIN_REWARD_MIN', 50),
    'win_reward_max'     => (int) env('ECONOMY_WIN_REWARD_MAX', 150),
    'loss_deduction_min' => (int) env('ECONOMY_LOSS_DEDUCTION_MIN', 20),
    'loss_deduction_max' => (int) env('ECONOMY_LOSS_DEDUCTION_MAX', 50),
    'draw_reward'        => (int) env('ECONOMY_DRAW_REWARD', 10),
];
