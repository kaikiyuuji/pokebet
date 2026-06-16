<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('battles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Player Pokémon
            $table->foreignId('player_pokemon_id')->constrained('pokemons');
            $table->unsignedSmallInteger('player_level');

            // Opponent Pokémon (random)
            $table->foreignId('opponent_pokemon_id')->constrained('pokemons');
            $table->unsignedSmallInteger('opponent_level');

            // Result
            $table->enum('result', ['win', 'loss', 'draw'])->nullable();
            $table->unsignedInteger('coins_awarded')->default(0);

            // Reproducibility
            $table->string('random_seed');

            $table->timestamps();
        });

        Schema::create('battle_turns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('battle_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('turn_number');

            // Attacker
            $table->enum('attacker', ['player', 'opponent']);
            $table->foreignId('move_id')->constrained('moves');

            // Damage
            $table->unsignedSmallInteger('damage_dealt');
            $table->boolean('is_critical')->default(false);
            $table->decimal('type_multiplier', 4, 2)->default(1.00);

            // HP after turn
            $table->unsignedSmallInteger('player_hp_remaining');
            $table->unsignedSmallInteger('opponent_hp_remaining');

            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('battle_turns');
        Schema::dropIfExists('battles');
    }
};
