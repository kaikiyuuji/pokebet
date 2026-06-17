<?php

use App\Http\Controllers\BattleController;
use App\Http\Controllers\BattleHistoryController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');

    // Battle
    Route::get('/battle/new',         [BattleController::class, 'create'])->name('battle.new');
    Route::post('/battle/opponent',   [BattleController::class, 'opponent'])->name('battle.opponent');
    Route::post('/battle',            [BattleController::class, 'store'])->name('battle.store');
    Route::get('/battle/{battle}',    [BattleController::class, 'show'])->name('battle.show');

    // Battle history & log
    Route::get('/battles',              [BattleHistoryController::class, 'index'])->name('battles.index');
    Route::get('/battles/{battle}/log', [BattleHistoryController::class, 'show'])->name('battles.log');

    // Profile
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
