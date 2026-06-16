<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pokemon_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('type_effectiveness', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attacking_type_id')->constrained('pokemon_types')->cascadeOnDelete();
            $table->foreignId('defending_type_id')->constrained('pokemon_types')->cascadeOnDelete();
            $table->decimal('multiplier', 4, 2)->default(1.00);
            $table->timestamps();

            $table->unique(['attacking_type_id', 'defending_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('type_effectiveness');
        Schema::dropIfExists('pokemon_types');
    }
};
