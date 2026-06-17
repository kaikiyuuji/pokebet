<?php

return [
    'base_url'     => env('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2'),
    'import_limit' => (int) env('POKEAPI_IMPORT_LIMIT', 2000),
    'delay_ms'     => (int) env('POKEAPI_IMPORT_DELAY_MS', 150),
    'image_fallback' => env('POKEMON_IMAGE_FALLBACK', '/images/pokemon-placeholder.png'),
];
