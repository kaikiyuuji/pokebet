<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roulette_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamp('next_spin_at')->nullable();
            $table->unsignedSmallInteger('bonus_spins')->default(0);
            $table->timestamps();
        });

        Schema::create('roulette_spins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('outcome_key');
            $table->string('outcome_type');
            $table->unsignedBigInteger('coins_awarded')->default(0);
            $table->unsignedInteger('weight');
            $table->boolean('used_bonus_spin')->default(false);
            $table->boolean('bonus_spin_awarded')->default(false);
            $table->unsignedBigInteger('balance_after');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roulette_spins');
        Schema::dropIfExists('roulette_states');
    }
};
