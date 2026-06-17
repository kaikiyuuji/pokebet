<?php

namespace App\Jobs;

use App\Game\Pokemon\PokemonImporter;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ImportPokemonDataJob implements ShouldQueue
{
    use Queueable;

    /** Max execution time: 2 hours */
    public int $timeout = 7200;

    /** No automatic retries — import failures need manual review */
    public int $tries = 1;

    public function __construct(
        public readonly string $step = 'all',
        public readonly int $limit = 2000,
    ) {}

    public function handle(PokemonImporter $importer): void
    {
        Log::info("ImportPokemonDataJob iniciado", ['step' => $this->step, 'limit' => $this->limit]);

        $progress = fn(string $msg) => Log::info("[PokeImport] {$msg}");

        match ($this->step) {
            'types'   => $importer->importTypes($progress),
            'moves'   => $importer->importMoves($this->limit, $progress),
            'pokemon' => $importer->importPokemon($this->limit, $progress),
            default   => $importer->importAll($this->limit, $progress),
        };

        Log::info("ImportPokemonDataJob concluído", ['step' => $this->step]);
    }

    public function failed(\Throwable $e): void
    {
        Log::error("ImportPokemonDataJob falhou", [
            'step'  => $this->step,
            'error' => $e->getMessage(),
        ]);
    }
}
