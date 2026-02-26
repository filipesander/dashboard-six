<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderLineItem;
use App\Models\OrderRefund;
use App\Helpers\OrderCache;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardMetricsService
{

    /**
     * Retorna todas as metricas do dashboard com cache
     * @return array
     */
    public function getMetrics(): array
    {
        return Cache::remember(
            OrderCache::key('dashboard.index'),
            now()->addMinutes(10),
            fn (): array => $this->calculateMetrics()
        );
    }

    /**
     * Calcula todas as metricas do dashboard
     * @return array
     */
    private function calculateMetrics(): array
    {
        $totalOrders = Order::count();
        $totalRevenueUsd = (float) Order::sum('total_price');
        $totalRevenueBrl = (float) Order::sum('local_currency_amount');
        $averageTicket = $totalOrders > 0 ? $totalRevenueUsd / $totalOrders : 0;

        $deliveredOrders = Order::where('fulfillment_status', 'Fully Fulfilled')->count();
        $deliveredRate = $totalOrders > 0 ? ($deliveredOrders / $totalOrders) * 100 : 0;
        $cancelledOrders = Order::where('status_id', 'Cancelled')->count();

        $uniqueCustomers = (int) Order::distinct('customer_id')->count('customer_id');
        $avgOrdersPerCustomer = $uniqueCustomers > 0 ? $totalOrders / $uniqueCustomers : 0;

        $refundAmount = (float) OrderRefund::sum('total_amount');
        $grossRevenue = $totalRevenueUsd;
        $netRevenue = $grossRevenue - $refundAmount;
        $refundRate = $grossRevenue > 0 ? ($refundAmount / $grossRevenue) * 100 : 0;

        $topProduct = OrderLineItem::query()
            ->selectRaw('title, SUM(quantity) as total_quantity, SUM(price * quantity) as total_revenue')
            ->whereNotNull('title')
            ->groupBy('title')
            ->orderByDesc('total_quantity')
            ->orderByDesc('total_revenue')
            ->first();

        $topProductsByRevenue = OrderLineItem::query()
            ->selectRaw('title as name, SUM(quantity) as total_quantity, SUM(price * quantity) as total_revenue')
            ->whereNotNull('title')
            ->where('title', '!=', '')
            ->groupBy('title')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get()
            ->map(function (OrderLineItem $item): array {
                return [
                    'name' => (string) $item->name,
                    'quantity' => (int) $item->total_quantity,
                    'revenue' => round((float) $item->total_revenue, 2),
                ];
            })
            ->values();

        $revenueByVariant = OrderLineItem::query()
            ->selectRaw('variant_title as variant, SUM(quantity) as total_quantity, SUM(price * quantity) as total_revenue')
            ->whereNotNull('variant_title')
            ->where('variant_title', '!=', '')
            ->groupBy('variant_title')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get()
            ->map(function (OrderLineItem $item): array {
                return [
                    'variant' => (string) $item->variant,
                    'quantity' => (int) $item->total_quantity,
                    'revenue' => round((float) $item->total_revenue, 2),
                ];
            })
            ->values();

        $topCitiesBySales = OrderAddress::query()
            ->join('orders', 'order_addresses.order_id', '=', 'orders.id')
            ->where('order_addresses.type', 'shipping')
            ->whereNotNull('order_addresses.city')
            ->where('order_addresses.city', '!=', '')
            ->selectRaw('order_addresses.city as city, COUNT(DISTINCT orders.id) as total_orders, SUM(orders.total_price) as total_revenue')
            ->groupBy('order_addresses.city')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get()
            ->map(function (OrderAddress $address): array {
                return [
                    'city' => (string) $address->city,
                    'orders' => (int) $address->total_orders,
                    'revenue' => round((float) $address->total_revenue, 2),
                ];
            })
            ->values();

        $refundedOrders = Order::has('refunds')->count();
        $deliveredAndRefunded = Order::query()
            ->where('fulfillment_status', 'Fully Fulfilled')
            ->has('refunds')
            ->count();
        $deliveredAndRefundedRate = $deliveredOrders > 0 ? ($deliveredAndRefunded / $deliveredOrders) * 100 : 0;

        $totalPaidOrders = Order::has('payment')->count();
        $paymentConversion = Order::query()
            ->join('order_payments', 'orders.id', '=', 'order_payments.order_id')
            ->whereNotNull('order_payments.cc_brand')
            ->where('order_payments.cc_brand', '!=', '')
            ->selectRaw('order_payments.cc_brand as method, COUNT(DISTINCT orders.id) as total_orders')
            ->groupBy('order_payments.cc_brand')
            ->orderByDesc('total_orders')
            ->get()
            ->map(function (Order $order) use ($totalPaidOrders): array {
                $count = (int) $order->total_orders;
                $conversion = $totalPaidOrders > 0 ? ($count / $totalPaidOrders) * 100 : 0;

                return [
                    'method' => (string) $order->method,
                    'orders' => $count,
                    'conversion' => round($conversion, 2),
                ];
            })
            ->values();

        $highRefundRateProducts = OrderLineItem::query()
            ->leftJoin('order_refunds', 'order_refunds.order_id', '=', 'order_line_items.order_id')
            ->selectRaw(
                'order_line_items.title as name, COUNT(DISTINCT order_line_items.order_id) as orders_with_product, COUNT(DISTINCT CASE WHEN order_refunds.id IS NOT NULL THEN order_line_items.order_id END) as refunded_orders_with_product, SUM(order_line_items.price * order_line_items.quantity) as total_revenue'
            )
            ->whereNotNull('order_line_items.title')
            ->where('order_line_items.title', '!=', '')
            ->whereRaw('LOWER(order_line_items.title) NOT LIKE ?', ['%shipping%'])
            ->groupBy('order_line_items.title')
            ->havingRaw('COUNT(DISTINCT CASE WHEN order_refunds.id IS NOT NULL THEN order_line_items.order_id END) > 0')
            ->orderByRaw('(COUNT(DISTINCT CASE WHEN order_refunds.id IS NOT NULL THEN order_line_items.order_id END) / NULLIF(COUNT(DISTINCT order_line_items.order_id), 0)) DESC')
            ->orderByDesc('refunded_orders_with_product')
            ->limit(10)
            ->get()
            ->map(function (OrderLineItem $item): array {
                $ordersWithProduct = (int) $item->orders_with_product;
                $refundedOrdersWithProduct = (int) $item->refunded_orders_with_product;
                $rate = $ordersWithProduct > 0 ? ($refundedOrdersWithProduct / $ordersWithProduct) * 100 : 0;

                return [
                    'name' => (string) $item->name,
                    'ordersWithProduct' => $ordersWithProduct,
                    'refundedOrdersWithProduct' => $refundedOrdersWithProduct,
                    'refundRate' => round($rate, 2),
                    'revenue' => round((float) $item->total_revenue, 2),
                ];
            })
            ->values();

        $reasonExpression = "COALESCE(NULLIF(note, ''), 'Sem motivo informado')";
        $refundReasons = OrderRefund::query()
            ->selectRaw("{$reasonExpression} as reason, COUNT(*) as total_refunds, SUM(total_amount) as total_amount")
            ->groupBy(DB::raw($reasonExpression))
            ->orderByDesc('total_refunds')
            ->limit(10)
            ->get()
            ->map(function (OrderRefund $refund): array {
                return [
                    'reason' => (string) $refund->reason,
                    'count' => (int) $refund->total_refunds,
                    'amount' => round((float) $refund->total_amount, 2),
                ];
            })
            ->values();

        $ordersByStatus = Order::selectRaw('status_id, COUNT(*) as count')
            ->groupBy('status_id')
            ->pluck('count', 'status_id');

        $ordersByPaymentMethod = Order::join('order_payments', 'orders.id', '=', 'order_payments.order_id')
            ->selectRaw('order_payments.cc_brand, COUNT(*) as count')
            ->whereNotNull('order_payments.cc_brand')
            ->groupBy('order_payments.cc_brand')
            ->pluck('count', 'cc_brand');

        $revenueByDate = Order::selectRaw('DATE(created_at) as date, SUM(total_price) as revenue, COUNT(*) as count')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        $recentOrders = Order::with('customer')
            ->latest()
            ->take(5)
            ->get();

        $totalOrdersWithItems = (int) OrderLineItem::distinct('order_id')->count('order_id');

        $multiProductOrders = (int) DB::table('order_line_items')
            ->select('order_id')
            ->whereNotNull('title')
            ->where('title', '!=', '')
            ->whereRaw('LOWER(title) NOT LIKE ?', ['%shipping%'])
            ->groupBy('order_id')
            ->havingRaw('COUNT(DISTINCT title) > 1')
            ->get()
            ->count();

        $upsellRate = $totalOrdersWithItems > 0
            ? ($multiProductOrders / $totalOrdersWithItems) * 100
            : 0;

        $upsellRevenueData = DB::table('order_line_items')
            ->select(
                'order_id',
                DB::raw('SUM(price * quantity) as order_total'),
                DB::raw('MIN(price) as min_price')
            )
            ->whereNotNull('title')
            ->where('title', '!=', '')
            ->whereRaw('LOWER(title) NOT LIKE ?', ['%shipping%'])
            ->groupBy('order_id')
            ->havingRaw('COUNT(DISTINCT title) > 1')
            ->get();

        $upsellRevenue = $upsellRevenueData->sum(function ($row) {
            return max(0, (float) $row->order_total - (float) $row->min_price);
        });

        $topCombinations = collect(DB::select("
            SELECT
                LEAST(a.title, b.title) as product_a,
                GREATEST(a.title, b.title) as product_b,
                COUNT(DISTINCT a.order_id) as pair_count
            FROM order_line_items a
            INNER JOIN order_line_items b
                ON a.order_id = b.order_id
                AND a.title < b.title
            WHERE a.title IS NOT NULL
                AND a.title != ''
                AND b.title IS NOT NULL
                AND b.title != ''
                AND LOWER(a.title) NOT LIKE '%shipping%'
                AND LOWER(b.title) NOT LIKE '%shipping%'
            GROUP BY LEAST(a.title, b.title), GREATEST(a.title, b.title)
            ORDER BY pair_count DESC
            LIMIT 5
        "))->map(fn ($row) => [
            'productA' => (string) $row->product_a,
            'productB' => (string) $row->product_b,
            'count' => (int) $row->pair_count,
        ])->values();

        $avgItemsPerOrder = $totalOrders > 0
            ? (float) OrderLineItem::sum('quantity') / $totalOrders
            : 0;

        return [
            'kpis' => [
                'totalOrders' => $totalOrders,
                'totalRevenue' => round($totalRevenueUsd, 2),
                'cancelledOrders' => $cancelledOrders,
                'totalRevenueUsd' => round($totalRevenueUsd, 2),
                'totalRevenueBrl' => round($totalRevenueBrl, 2),
                'averageTicket' => round($averageTicket, 2),
                'deliveredOrders' => $deliveredOrders,
                'deliveredRate' => round($deliveredRate, 2),
                'uniqueCustomers' => $uniqueCustomers,
                'avgOrdersPerCustomer' => round($avgOrdersPerCustomer, 2),
                'grossRevenue' => round($grossRevenue, 2),
                'refundAmount' => round($refundAmount, 2),
                'netRevenue' => round($netRevenue, 2),
                'refundRate' => round($refundRate, 2),
                'topProduct' => [
                    'name' => $topProduct?->title,
                    'quantity' => (int) ($topProduct?->total_quantity ?? 0),
                    'revenue' => round((float) ($topProduct?->total_revenue ?? 0), 2),
                ],
            ],
            'charts' => [
                'ordersByStatus' => $ordersByStatus,
                'ordersByPaymentMethod' => $ordersByPaymentMethod,
                'revenueByDate' => $revenueByDate,
            ],
            'intermediate' => [
                'topProductsByRevenue' => $topProductsByRevenue,
                'revenueByVariant' => $revenueByVariant,
                'topCitiesBySales' => $topCitiesBySales,
                'deliveredAndRefunded' => [
                    'deliveredOrders' => $deliveredOrders,
                    'refundedOrders' => $refundedOrders,
                    'deliveredAndRefunded' => $deliveredAndRefunded,
                    'deliveredAndRefundedRate' => round($deliveredAndRefundedRate, 2),
                ],
                'paymentConversion' => $paymentConversion,
                'upsellAnalysis' => [
                    'upsellRate' => round($upsellRate, 2),
                    'upsellRevenue' => round((float) $upsellRevenue, 2),
                    'avgItemsPerOrder' => round($avgItemsPerOrder, 2),
                    'multiProductOrders' => $multiProductOrders,
                    'topCombinations' => $topCombinations,
                ],
            ],
            'advanced' => [
                'highRefundRateProducts' => $highRefundRateProducts,
                'refundReasons' => $refundReasons,
            ],
            'recentOrders' => $recentOrders,
        ];
    }
}
