<?php

use Illuminate\Database\Migrations\Migration;

// Pokémon types now come from PokéAPI at runtime — no local tables needed.
return new class extends Migration
{
    public function up(): void {}
    public function down(): void {}
};
