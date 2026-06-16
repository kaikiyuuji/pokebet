<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PokemonDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Types ─────────────────────────────────────────────────────────
        $types = [
            ['id' => 1,  'name' => 'Normal',   'slug' => 'normal'],
            ['id' => 2,  'name' => 'Fogo',     'slug' => 'fire'],
            ['id' => 3,  'name' => 'Água',     'slug' => 'water'],
            ['id' => 4,  'name' => 'Elétrico', 'slug' => 'electric'],
            ['id' => 5,  'name' => 'Grama',    'slug' => 'grass'],
            ['id' => 6,  'name' => 'Gelo',     'slug' => 'ice'],
            ['id' => 7,  'name' => 'Lutador',  'slug' => 'fighting'],
            ['id' => 8,  'name' => 'Veneno',   'slug' => 'poison'],
            ['id' => 9,  'name' => 'Terra',    'slug' => 'ground'],
            ['id' => 10, 'name' => 'Voador',   'slug' => 'flying'],
            ['id' => 11, 'name' => 'Psíquico', 'slug' => 'psychic'],
            ['id' => 12, 'name' => 'Inseto',   'slug' => 'bug'],
            ['id' => 13, 'name' => 'Pedra',    'slug' => 'rock'],
            ['id' => 14, 'name' => 'Fantasma', 'slug' => 'ghost'],
            ['id' => 15, 'name' => 'Dragão',   'slug' => 'dragon'],
            ['id' => 16, 'name' => 'Sombrio',  'slug' => 'dark'],
            ['id' => 17, 'name' => 'Aço',      'slug' => 'steel'],
            ['id' => 18, 'name' => 'Fada',     'slug' => 'fairy'],
        ];

        foreach ($types as $t) {
            DB::table('pokemon_types')->updateOrInsert(['id' => $t['id']], $t);
        }

        // ── 2. Type effectiveness chart (Gen VI+) ─────────────────────────────
        // atk_id => [def_id => multiplier] (only non-1.0 entries)
        $chart = [
            1  => [13 => 0.5, 14 => 0.0, 17 => 0.5],                             // Normal
            2  => [2 => 0.5,  3 => 0.5,  5 => 2.0,  6 => 2.0, 12 => 2.0, 13 => 0.5, 15 => 0.5, 17 => 0.5], // Fire
            3  => [2 => 2.0,  3 => 0.5,  4 => 2.0,  5 => 0.5, 9 => 2.0,  17 => 0.5],             // Water
            4  => [3 => 2.0,  4 => 0.5,  5 => 0.5,  9 => 0.0, 10 => 2.0, 17 => 0.5],             // Electric
            5  => [2 => 0.5,  3 => 2.0,  5 => 0.5,  8 => 0.5, 9 => 2.0,  10 => 0.5, 17 => 0.5], // Grass
            6  => [2 => 0.5,  3 => 0.5,  5 => 2.0,  9 => 2.0, 10 => 2.0, 15 => 2.0, 6 => 0.5],  // Ice
            7  => [1 => 2.0,  6 => 2.0,  11 => 0.5, 12 => 0.5, 13 => 2.0, 14 => 0.0, 17 => 2.0, 16 => 0.5, 18 => 0.5], // Fighting
            8  => [5 => 2.0,  7 => 0.5,  8 => 0.5,  13 => 0.5, 9 => 0.5, 14 => 0.5, 18 => 0.5], // Poison
            9  => [2 => 2.0,  4 => 2.0,  8 => 2.0,  9 => 0.5, 13 => 2.0, 5 => 0.5,  10 => 0.0], // Ground
            10 => [4 => 0.5,  5 => 2.0,  7 => 2.0,  12 => 0.5, 13 => 0.5],      // Flying
            11 => [7 => 2.0,  8 => 2.0,  11 => 0.5, 16 => 0.0, 17 => 0.5],      // Psychic
            12 => [2 => 0.5,  7 => 0.5,  8 => 0.5,  10 => 0.5, 14 => 0.5, 5 => 2.0, 11 => 2.0, 16 => 2.0, 18 => 0.5], // Bug
            13 => [2 => 2.0,  6 => 2.0,  10 => 2.0, 12 => 2.0, 7 => 0.5, 9 => 0.5, 17 => 0.5, 3 => 0.5],  // Rock
            14 => [1 => 0.0,  7 => 0.0,  8 => 0.5,  11 => 2.0, 14 => 2.0, 16 => 0.5],           // Ghost
            15 => [15 => 2.0, 17 => 0.5, 18 => 0.0],                             // Dragon
            16 => [7 => 2.0,  11 => 2.0, 14 => 0.5, 16 => 0.5, 18 => 0.5],      // Dark
            17 => [2 => 0.5,  3 => 0.5,  4 => 0.5,  6 => 2.0,  1 => 0.5, 5 => 0.5, 13 => 2.0, 17 => 0.5, 18 => 2.0], // Steel
            18 => [7 => 2.0,  15 => 2.0, 16 => 2.0, 2 => 0.5,  8 => 0.5, 17 => 0.5],            // Fairy
        ];

        $rows = [];
        $now  = now();
        for ($atk = 1; $atk <= 18; $atk++) {
            for ($def = 1; $def <= 18; $def++) {
                $mult = $chart[$atk][$def] ?? 1.0;
                $rows[] = [
                    'attacking_type_id' => $atk,
                    'defending_type_id' => $def,
                    'multiplier'        => $mult,
                    'created_at'        => $now,
                    'updated_at'        => $now,
                ];
            }
        }
        DB::table('type_effectiveness')->delete();
        foreach (array_chunk($rows, 50) as $chunk) {
            DB::table('type_effectiveness')->insert($chunk);
        }

        // ── 3. Moves ──────────────────────────────────────────────────────────
        $moves = [
            // [id, name, slug, type_id, power, accuracy, pp, damage_class]
            [1,  'Tackle',         'tackle',          1,  40,  100, 35, 'physical'],
            [2,  'Scratch',        'scratch',         1,  40,  100, 35, 'physical'],
            [3,  'Vine Whip',      'vine-whip',       5,  45,  100, 25, 'physical'],
            [4,  'Ember',          'ember',           2,  40,  100, 25, 'special'],
            [5,  'Water Gun',      'water-gun',       3,  40,  100, 25, 'special'],
            [6,  'ThunderShock',   'thunder-shock',   4,  40,  100, 30, 'special'],
            [7,  'Razor Leaf',     'razor-leaf',      5,  55,  95,  25, 'physical'],
            [8,  'Flamethrower',   'flamethrower',    2,  90,  100, 15, 'special'],
            [9,  'Surf',           'surf',            3,  90,  100, 15, 'special'],
            [10, 'Thunderbolt',    'thunderbolt',     4,  90,  100, 15, 'special'],
            [11, 'Solar Beam',     'solar-beam',      5,  120, 100, 10, 'special'],
            [12, 'Fire Blast',     'fire-blast',      2,  110, 85,  5,  'special'],
            [13, 'Hydro Pump',     'hydro-pump',      3,  110, 80,  5,  'special'],
            [14, 'Thunder',        'thunder',         4,  110, 70,  10, 'special'],
            [15, 'Headbutt',       'headbutt',        1,  70,  100, 15, 'physical'],
            [16, 'Body Slam',      'body-slam',       1,  85,  100, 15, 'physical'],
            [17, 'Hyper Beam',     'hyper-beam',      1,  150, 90,  5,  'special'],
            [18, 'Wing Attack',    'wing-attack',     10, 60,  100, 35, 'physical'],
            [19, 'Peck',           'peck',            10, 35,  100, 35, 'physical'],
            [20, 'Bite',           'bite',            16, 60,  100, 25, 'physical'],
            [21, 'Crunch',         'crunch',          16, 80,  100, 15, 'physical'],
            [22, 'Psychic',        'psychic',         11, 90,  100, 10, 'special'],
            [23, 'Quick Attack',   'quick-attack',    1,  40,  100, 30, 'physical'],
            [24, 'Swift',          'swift',           1,  60,  null,20, 'special'],
            [25, 'Ice Beam',       'ice-beam',        6,  90,  100, 10, 'special'],
            [26, 'Blizzard',       'blizzard',        6,  110, 70,  5,  'special'],
            [27, 'Earthquake',     'earthquake',      9,  100, 100, 10, 'physical'],
            [28, 'Rock Slide',     'rock-slide',      13, 75,  90,  10, 'physical'],
            [29, 'Dragon Claw',    'dragon-claw',     15, 80,  100, 15, 'physical'],
            [30, 'Aerial Ace',     'aerial-ace',      10, 60,  null,20, 'physical'],
            [31, 'Shadow Ball',    'shadow-ball',     14, 80,  100, 15, 'special'],
            [32, 'Slash',          'slash',           1,  70,  100, 20, 'physical'],
            [33, 'Poison Sting',   'poison-sting',    8,  15,  100, 35, 'physical'],
            [34, 'Sludge Bomb',    'sludge-bomb',     8,  90,  100, 10, 'special'],
            [35, 'Iron Tail',      'iron-tail',       17, 100, 75,  15, 'physical'],
            [36, 'Close Combat',   'close-combat',    7,  120, 100, 5,  'physical'],
            [37, 'Leaf Blade',     'leaf-blade',      5,  90,  100, 15, 'physical'],
            [38, 'Bubble Beam',    'bubble-beam',     3,  65,  100, 20, 'special'],
            [39, 'Brick Break',    'brick-break',     7,  75,  100, 15, 'physical'],
            [40, 'Bug Bite',       'bug-bite',        12, 60,  100, 20, 'physical'],
        ];

        $now = now();
        foreach ($moves as [$id, $name, $slug, $type_id, $power, $accuracy, $pp, $class]) {
            DB::table('moves')->updateOrInsert(['id' => $id], [
                'pokeapi_id'   => $id,
                'name'         => $name,
                'slug'         => $slug,
                'type_id'      => $type_id,
                'power'        => $power,
                'accuracy'     => $accuracy,
                'pp'           => $pp,
                'damage_class' => $class,
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);
        }

        // ── 4. Pokémon ────────────────────────────────────────────────────────
        $pokemon = [
            // [id, pokeapi_id, name, slug, primary_type, secondary_type, hp, atk, def, sp_atk, sp_def, spd, sprite_front]
            [1,  1,   'Bulbasaur',  'bulbasaur',  5,  8,  45, 49, 49, 65, 65, 45],
            [2,  2,   'Ivysaur',    'ivysaur',    5,  8,  60, 62, 63, 80, 80, 60],
            [3,  3,   'Venusaur',   'venusaur',   5,  8,  80, 82, 83, 100,100, 80],
            [4,  4,   'Charmander', 'charmander', 2,  null,39, 52, 43, 60, 50, 65],
            [5,  5,   'Charmeleon', 'charmeleon', 2,  null,58, 64, 58, 80, 65, 80],
            [6,  6,   'Charizard',  'charizard',  2,  10, 78, 84, 78, 109,85, 100],
            [7,  7,   'Squirtle',   'squirtle',   3,  null,44, 48, 65, 50, 64, 43],
            [8,  8,   'Wartortle',  'wartortle',  3,  null,59, 63, 80, 65, 80, 58],
            [9,  9,   'Blastoise',  'blastoise',  3,  null,79, 83, 100,85, 105,78],
            [10, 25,  'Pikachu',    'pikachu',    4,  null,35, 55, 40, 50, 50, 90],
            [11, 26,  'Raichu',     'raichu',     4,  null,60, 90, 55, 90, 80, 110],
            [12, 39,  'Jigglypuff', 'jigglypuff', 1,  18, 115,45, 20, 45, 25, 20],
            [13, 52,  'Meowth',     'meowth',     1,  null,40, 45, 35, 40, 40, 90],
            [14, 54,  'Psyduck',    'psyduck',    3,  null,50, 52, 48, 65, 50, 55],
            [15, 58,  'Growlithe',  'growlithe',  2,  null,55, 70, 45, 70, 50, 60],
            [16, 63,  'Abra',       'abra',       11, null,25, 20, 15, 105,55, 90],
            [17, 66,  'Machop',     'machop',     7,  null,70, 80, 50, 35, 35, 35],
            [18, 74,  'Geodude',    'geodude',    13, 9,  40, 80, 100,30, 30, 20],
            [19, 94,  'Gengar',     'gengar',     14, 8,  60, 65, 60, 130,75, 110],
            [20, 130, 'Gyarados',   'gyarados',   3,  10, 95, 125,79, 60, 100,81],
            [21, 131, 'Lapras',     'lapras',     3,  6,  130,85, 80, 85, 95, 60],
            [22, 143, 'Snorlax',    'snorlax',    1,  null,160,110,65, 65, 110,30],
            [23, 147, 'Dratini',    'dratini',    15, null,41, 64, 45, 50, 50, 50],
            [24, 149, 'Dragonite',  'dragonite',  15, 10, 91, 134,95, 100,100,80],
            [25, 150, 'Mewtwo',     'mewtwo',     11, null,106,110,90, 154,90, 130],
        ];

        foreach ($pokemon as [$id, $papi_id, $name, $slug, $pt, $st, $hp, $atk, $def, $spa, $spd, $spe]) {
            $sprite = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{$papi_id}.png";
            DB::table('pokemons')->updateOrInsert(['id' => $id], [
                'pokeapi_id'           => $papi_id,
                'name'                 => $name,
                'slug'                 => $slug,
                'primary_type_id'      => $pt,
                'secondary_type_id'    => $st,
                'base_hp'              => $hp,
                'base_attack'          => $atk,
                'base_defense'         => $def,
                'base_special_attack'  => $spa,
                'base_special_defense' => $spd,
                'base_speed'           => $spe,
                'sprite_front'         => $sprite,
                'sprite_official'      => null,
                'sprite_home'          => null,
                'price'                => 0,
                'is_available'         => true,
                'created_at'           => now(),
                'updated_at'           => now(),
            ]);
        }

        // ── 5. Pokémon → Moves pivot ──────────────────────────────────────────
        // [pokemon_id => [move_ids...]]
        $pokemonMoves = [
            1  => [1, 3, 7, 37, 11, 34, 8,  15],   // Bulbasaur
            2  => [1, 3, 7, 37, 11, 34, 8,  15],   // Ivysaur
            3  => [1, 3, 7, 37, 11, 34, 8,  17],   // Venusaur
            4  => [2, 4, 8, 12, 32, 35, 17, 29],   // Charmander
            5  => [2, 4, 8, 12, 32, 35, 17, 29],   // Charmeleon
            6  => [2, 4, 8, 12, 32, 35, 17, 30],   // Charizard
            7  => [2, 5, 9, 13, 38, 25, 15, 39],   // Squirtle
            8  => [2, 5, 9, 13, 38, 25, 15, 39],   // Wartortle
            9  => [2, 5, 9, 13, 38, 25, 27, 39],   // Blastoise
            10 => [1, 6, 10, 14, 23, 35, 24, 30],  // Pikachu
            11 => [1, 6, 10, 14, 23, 35, 24, 30],  // Raichu
            12 => [1, 15, 16, 24, 25, 31, 17, 36], // Jigglypuff
            13 => [2, 20, 21, 32, 23, 15, 24, 1],  // Meowth
            14 => [5, 9, 22, 25, 38, 1,  23, 39],  // Psyduck
            15 => [4, 8, 12, 32, 35, 15, 27, 2],   // Growlithe
            16 => [22, 31, 11, 24, 1,  23, 17, 10],// Abra
            17 => [36, 39, 15, 16, 27, 1,  17, 32],// Machop
            18 => [28, 15, 27, 1,  35, 32, 39, 2], // Geodude
            19 => [31, 20, 21, 22, 34, 1,  17, 32],// Gengar
            20 => [9, 13, 20, 21, 15, 16, 17, 32], // Gyarados
            21 => [9, 13, 25, 26, 15, 16, 35, 39], // Lapras
            22 => [15, 16, 17, 32, 27, 36, 1,  20],// Snorlax
            23 => [1, 29, 17, 32, 15, 25, 23, 2],  // Dratini
            24 => [29, 17, 27, 32, 18, 30, 35, 36],// Dragonite
            25 => [22, 17, 27, 10, 31, 25, 32, 36],// Mewtwo
        ];

        DB::table('pokemon_moves')->delete();
        $pivotRows = [];
        $now = now();
        foreach ($pokemonMoves as $pokId => $moveIds) {
            foreach ($moveIds as $movId) {
                $pivotRows[] = [
                    'pokemon_id' => $pokId,
                    'move_id'    => $movId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        DB::table('pokemon_moves')->insert($pivotRows);

        $this->command->info('✅ Importados: ' . count($types) . ' tipos, ' . count($moves) . ' golpes, ' . count($pokemon) . ' Pokémon.');
    }
}
