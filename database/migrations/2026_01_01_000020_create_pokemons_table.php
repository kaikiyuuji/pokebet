<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pokemons', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('pokeapi_id')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('primary_type_id')->constrained('pokemon_types');
            $table->foreignId('secondary_type_id')->nullable()->constrained('pokemon_types');

            // Base stats
            $table->unsignedSmallInteger('base_hp');
            $table->unsignedSmallInteger('base_attack');
            $table->unsignedSmallInteger('base_defense');
            $table->unsignedSmallInteger('base_special_attack');
            $table->unsignedSmallInteger('base_special_defense');
            $table->unsignedSmallInteger('base_speed');

            // Sprites (stored locally/S3)
            $table->string('sprite_front')->nullable();
            $table->string('sprite_official')->nullable();
            $table->string('sprite_home')->nullable();

            // Shop
            $table->unsignedInteger('price')->default(500);
            $table->boolean('is_available')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pokemons');
    }
};
