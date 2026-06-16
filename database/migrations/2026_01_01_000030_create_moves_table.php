<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moves', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('pokeapi_id')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('type_id')->constrained('pokemon_types');
            $table->enum('damage_class', ['physical', 'special', 'status']);
            $table->unsignedSmallInteger('power')->nullable();
            $table->unsignedSmallInteger('accuracy')->nullable();
            $table->unsignedSmallInteger('pp');
            $table->timestamps();
        });

        Schema::create('pokemon_moves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pokemon_id')->constrained('pokemons')->cascadeOnDelete();
            $table->foreignId('move_id')->constrained('moves')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['pokemon_id', 'move_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pokemon_moves');
        Schema::dropIfExists('moves');
    }
};
