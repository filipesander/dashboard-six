<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Helpers\OrderCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{

    /**
     * Retorno dos dados para Página de Pedidos
     * @return Response
     */
    public function index(Request $request): Response
    {
        $allowedSorts = ['created_at', 'order_number', 'name', 'status_id', 'total_price'];
        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';

        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }

        $filters = [
            'search' => (string) $request->input('search', ''),
            'status' => (string) $request->input('status', ''),
            'date_from' => (string) $request->input('date_from', ''),
            'date_to' => (string) $request->input('date_to', ''),
            'payment_method' => (string) $request->input('payment_method', ''),
            'sort' => $sort,
            'direction' => $direction,
        ];

        $cacheKey = OrderCache::key('orders.index', [...$filters, 'page' => (int) $request->input('page', 1)]);

        $orders = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($filters) {
            return Order::with(['customer', 'payment'])
                ->search($filters['search'])
                ->filterByStatus($filters['status'])
                ->filterByDateRange($filters['date_from'], $filters['date_to'])
                ->filterByPaymentMethod($filters['payment_method'])
                ->orderBy($filters['sort'], $filters['direction'])
                ->paginate(10)
                ->withQueryString();
        });

        $availableStatuses = Cache::remember(OrderCache::key('orders.statuses'), now()->addMinutes(30), function () {
            $statuses = Order::query()
                ->select('status_id')
                ->distinct()
                ->orderBy('status_id')
                ->pluck('status_id')
                ->values()
                ->all();

            $merged = [
                ...$statuses,
                'Fulfilled',
                'Unfulfilled',
                'Partially Fulfilled',
                'Refunded',
                'Cancelled',
            ];

            $normalized = array_map(static fn ($status) => trim((string) $status), $merged);

            return array_values(array_unique(array_filter($normalized)));
        });

        $availablePaymentMethods = Cache::remember(OrderCache::key('orders.payment-methods'), now()->addMinutes(30), function () {
            return OrderPayment::query()
                ->whereNotNull('cc_brand')
                ->where('cc_brand', '!=', '')
                ->select('cc_brand')
                ->distinct()
                ->orderBy('cc_brand')
                ->pluck('cc_brand')
                ->values()
                ->all();
        });

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filters' => $filters,
            'availableStatuses' => $availableStatuses,
            'availablePaymentMethods' => $availablePaymentMethods,
        ]);
    }

    /**
     * Pagina de Detalhes do Pedido
     * @return Response
     */
    public function show(Order $order): Response
    {
        $order->load([
            'customer',
            'lineItems',
            'payment',
            'billingAddress',
            'shippingAddress',
            'fulfillments',
            'refunds',
        ]);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }
}
