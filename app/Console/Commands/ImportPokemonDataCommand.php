<?php

namespace App\Console\Commands;

use App\Game\Pokemon\PokemonImporter;
use App\Jobs\ImportPokemonDataJob;
use Illuminate\Console\Command;

class ImportPokemonDataCommand extends Command
{
    protected $signature = 'pokebet:import
        {--step=all : Etapa a executar: all, types, moves, pokemon}
        {--limit=   : Limite de Pokémon/golpes (padrão: POKEAPI_IMPORT_LIMIT)}
        {--queue    : Despachar como job em background}
        {--fresh    : Limpar dados existentes antes de importar (cuidado!)}';

    protected $description = 'Importa dados da PokéAPI para o banco local';

    public function handle(PokemonImporter $importer): int
    {
        $step  = $this->option('step');
        $limit = (int) ($this->option('limit') ?: config('pokeapi.import_limit', 2000));
        $queue = $this->option('queue');
        $fresh = $this->option('fresh');

        $validSteps = ['all', 'types', 'moves', 'pokemon'];
        if (!in_array($step, $validSteps)) {
            $this->error("Etapa inválida: {$step}. Use: " . implode(', ', $validSteps));
            return self::FAILURE;
        }

        if ($fresh && !$this->confirmFresh($step)) {
            return self::SUCCESS;
        }

        if ($queue) {
            ImportPokemonDataJob::dispatch($step, $limit);
            $this->info("✅ Job despachado: step={$step}, limit={$limit}");
            $this->line('   Acompanhe via: php artisan queue:work');
            return self::SUCCESS;
        }

        $this->info("🚀 Iniciando importação PokéAPI — step={$step}, limit={$limit}");
        $this->newLine();

        $progress = function (string $message) {
            if (str_starts_with($message, '✅')) {
                $this->info($message);
            } elseif (str_starts_with($message, '⏳')) {
                $this->line("<fg=cyan>{$message}</>");
            } else {
                $this->line("  {$message}");
            }
        };

        $start = microtime(true);

        match ($step) {
            'types'   => $importer->importTypes($progress),
            'moves'   => $importer->importMoves($limit, $progress),
            'pokemon' => $importer->importPokemon($limit, $progress),
            default   => $importer->importAll($limit, $progress),
        };

        $elapsed = round(microtime(true) - $start, 1);
        $this->newLine();
        $this->info("🏁 Importação concluída em {$elapsed}s");

        return self::SUCCESS;
    }

    private function confirmFresh(string $step): bool
    {
        $tables = match ($step) {
            'types'   => ['pokemon_types', 'type_effectiveness'],
            'moves'   => ['moves', 'pokemon_moves'],
            'pokemon' => ['pokemons', 'pokemon_moves'],
            default   => ['pokemon_types', 'type_effectiveness', 'moves', 'pokemon_moves', 'pokemons'],
        };

        $tableList = implode(', ', $tables);
        if (!$this->confirm("⚠️  Isso vai truncar: {$tableList}. Continuar?")) {
            $this->line('Cancelado.');
            return false;
        }

        foreach (array_reverse($tables) as $table) {
            \Illuminate\Support\Facades\DB::table($table)->truncate();
            $this->line("  Truncado: {$table}");
        }

        return true;
    }
}
