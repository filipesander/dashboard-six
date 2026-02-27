<?php

namespace App\Console\Commands;

use App\Services\OrderImportService;
use Illuminate\Console\Command;

class ImportOrdersCommand extends Command
{
    protected $signature = 'orders:import';
    protected $description = 'Importa dados da API Grupo Six';

    /**
     * Comando para buscar dados no EndPoint do GrupoSix
     * 
     * @param OrderImportService $service
     * @return int
     */
    public function handle(OrderImportService $service): int
    {
        $this->info('Importando dados...');

        try {
            $count = $service->import();
            $this->info("Sucesso ao importar {$count} pedidos.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Importação falhou: {$e->getMessage()}");

            return self::FAILURE;
        }
    }
}
