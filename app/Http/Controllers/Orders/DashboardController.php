<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Services\DashboardMetricsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{

    /**
     * Executa a sincronizacao de pedidos via comando artisan
     * @return RedirectResponse
     */
    public function sync(): RedirectResponse
    {
        $exitCode = Artisan::call('orders:import');
        $output = trim(Artisan::output());
        $output = preg_replace('/\e\[[\d;]*m/', '', $output ?? '') ?: '';

        if ($exitCode === 0) {
            return to_route('dashboard')->with(
                'success',
                'Dados sincronizados com sucesso.'
            );
        }

        return to_route('dashboard')->with(
            'error',
            'Falha ao sincronizar dados.'
        );
    }

    /**
     * Retorno dos dados para página do dashboard
     * @return Response
     */
    public function index(DashboardMetricsService $service): Response
    {
        return Inertia::render('dashboard', $service->getMetrics());
    }
}
