import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { KpiCards } from '@/components/orders/kpi-cards';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { show as ordersShow, index as ordersIndex } from '@/routes/orders';
import type { BreadcrumbItem } from '@/types';
import type { AdvancedMetrics, ChartData, DashboardKpis, IntermediateMetrics, Order } from '@/types/order';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

type Props = {
    kpis: DashboardKpis;
    charts: ChartData;
    intermediate: IntermediateMetrics;
    advanced: AdvancedMetrics;
    recentOrders: Order[];
};

const STATUS_COLORS: Record<string, string> = {
    Fulfilled: '#16a34a',
    Unfulfilled: '#6b7280',
    'Partially Fulfilled': '#f59e0b',
    Refunded: '#ef4444',
    Cancelled: '#991b1b',
};

const PAYMENT_COLORS: Record<string, string> = {
    visa: '#1a1f71',
    mastercard: '#eb001b',
    amex: '#006fcf',
    discover: '#ff6b00',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
}

function formatPercent(value: number): string {
    return `${Number(value).toFixed(2)}%`;
}

export default function Dashboard({ kpis, charts, intermediate, advanced, recentOrders }: Props) {
    const { flash } = usePage<{
        flash?: {
            success?: string | null;
            error?: string | null;
        };
    }>().props;
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                style: {
                    background: '#16a34a',
                    color: '#ffffff',
                },
                progressStyle: {
                    background: '#bbf7d0',
                },
            });
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    const handleSync = () => {
        router.post('/dashboard/sync', {}, {
            preserveScroll: true,
            onStart: () => setIsSyncing(true),
            onFinish: () => setIsSyncing(false),
        });
    };

    const statusLabels = Object.keys(charts.ordersByStatus);
    const statusData = Object.values(charts.ordersByStatus);
    const paymentLabels = Object.keys(charts.ordersByPaymentMethod);
    const paymentData = Object.values(charts.ordersByPaymentMethod);
    const topProducts = intermediate.topProductsByRevenue;
    const topCities = intermediate.topCitiesBySales;

    const statusChartData = {
        labels: statusLabels,
        datasets: [
            {
                data: statusData,
                backgroundColor: statusLabels.map((s) => STATUS_COLORS[s] ?? '#9ca3af'),
                borderWidth: 0,
            },
        ],
    };

    const paymentChartData = {
        labels: paymentLabels.map((l) => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [
            {
                data: paymentData,
                backgroundColor: paymentLabels.map((p) => PAYMENT_COLORS[p] ?? '#9ca3af'),
                borderWidth: 0,
            },
        ],
    };

    const revenueChartData = {
        labels: charts.revenueByDate.map((d) => formatDate(d.date)),
        datasets: [
            {
                label: 'Receita',
                data: charts.revenueByDate.map((d) => Number(d.revenue)),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true,
            },
            {
                label: 'Pedidos',
                data: charts.revenueByDate.map((d) => d.count),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                fill: true,
                yAxisID: 'y1',
            },
        ],
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 16,
                    usePointStyle: true,
                },
            },
        },
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                ticks: {
                    callback: (value: string | number) => formatCurrency(Number(value)),
                },
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    const topProductsChartData = {
        labels: topProducts.map((item) => item.name),
        datasets: [
            {
                label: 'Receita',
                data: topProducts.map((item) => Number(item.revenue)),
                backgroundColor: '#2563eb',
                borderRadius: 6,
            },
        ],
    };

    const topCitiesChartData = {
        labels: topCities.map((item) => item.city),
        datasets: [
            {
                label: 'Receita',
                data: topCities.map((item) => Number(item.revenue)),
                backgroundColor: '#0f766e',
                borderRadius: 6,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: (value: string | number) => formatCurrency(Number(value)),
                },
            },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-end">
                    <Button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
                    >
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
                    </Button>
                </div>
                <KpiCards kpis={kpis} />

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pedidos por Status</CardTitle>
                            <CardDescription>Distribuição de status dos pedidos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Pie data={statusChartData} options={pieOptions} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Pedidos por Método de Pagamento</CardTitle>
                            <CardDescription>Distribuição dos métodos de pagamento utilizados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Pie data={paymentChartData} options={pieOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Receita ao Longo do Tempo</CardTitle>
                        <CardDescription>Tendência diária de receita e quantidade de pedidos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <Line data={revenueChartData} options={lineOptions} />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 5 Produtos por Receita</CardTitle>
                            <CardDescription>Métricas intermediárias do funil de vendas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Bar data={topProductsChartData} options={barOptions} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 10 Cidades em Vendas</CardTitle>
                            <CardDescription>Receita agregada por cidade de entrega</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Bar data={topCitiesChartData} options={barOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Faturamento por Variante</CardTitle>
                            <CardDescription>Top variantes por receita</CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[320px] overflow-auto">
                            <div className="space-y-3">
                                {intermediate.revenueByVariant.map((variant) => (
                                    <div key={variant.variant} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">{variant.variant}</p>
                                            <p className="text-xs text-muted-foreground">Qtd: {variant.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold">{formatCurrency(variant.revenue)}</p>
                                    </div>
                                ))}
                                {intermediate.revenueByVariant.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Sem dados de variantes.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Entregues e Reembolsados</CardTitle>
                            <CardDescription>Pedidos entregues com incidência de reembolso</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <span>Pedidos Entregues</span>
                                <span className="font-semibold">{intermediate.deliveredAndRefunded.deliveredOrders}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <span>Pedidos Reembolsados</span>
                                <span className="font-semibold">{intermediate.deliveredAndRefunded.refundedOrders}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <span>Entregues e Reembolsados</span>
                                <span className="font-semibold">{intermediate.deliveredAndRefunded.deliveredAndRefunded}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <span>Taxa sobre entregues</span>
                                <span className="font-semibold">
                                    {formatPercent(intermediate.deliveredAndRefunded.deliveredAndRefundedRate)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Conversão por Forma de Pagamento</CardTitle>
                        <CardDescription>Participação de pedidos por bandeira/cartão</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {intermediate.paymentConversion.map((item) => (
                                <div key={item.method} className="rounded-md border p-3">
                                    <p className="text-sm font-medium capitalize">{item.method}</p>
                                    <p className="text-xs text-muted-foreground">{item.orders} pedidos</p>
                                    <p className="mt-1 text-lg font-semibold">{formatPercent(item.conversion)}</p>
                                </div>
                            ))}
                            {intermediate.paymentConversion.length === 0 && (
                                <p className="text-sm text-muted-foreground">Sem dados de conversão por pagamento.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analise de Upsell</CardTitle>
                            <CardDescription>Metricas de vendas adicionais por pedido</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <span>Taxa de Upsell</span>
                                <span className="font-semibold">{formatPercent(intermediate.upsellAnalysis.upsellRate)}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <span>Pedidos com Multiplos Produtos</span>
                                <span className="font-semibold">{intermediate.upsellAnalysis.multiProductOrders}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <span>Receita de Upsell</span>
                                <span className="font-semibold">{formatCurrency(intermediate.upsellAnalysis.upsellRevenue)}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <span>Media de Itens por Pedido</span>
                                <span className="font-semibold">{intermediate.upsellAnalysis.avgItemsPerOrder.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Combinacoes de Produtos</CardTitle>
                            <CardDescription>Pares de produtos mais vendidos juntos</CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[320px] overflow-auto">
                            <div className="space-y-3">
                                {intermediate.upsellAnalysis.topCombinations.map((combo, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">{combo.productA}</p>
                                            <p className="text-xs text-muted-foreground">+ {combo.productB}</p>
                                        </div>
                                        <p className="text-sm font-semibold">{combo.count} pedidos</p>
                                    </div>
                                ))}
                                {intermediate.upsellAnalysis.topCombinations.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Sem combinacoes de produtos encontradas.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Produtos com Alta Taxa de Reembolso</CardTitle>
                            <CardDescription>Análise avançada por item</CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[320px] overflow-auto">
                            <div className="space-y-3">
                                {advanced.highRefundRateProducts.map((item) => (
                                    <div key={item.name} className="rounded-md border p-3">
                                        <p className="text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Pedidos com o produto: {item.ordersWithProduct} | Pedidos reembolsados:{' '}
                                            {item.refundedOrdersWithProduct}
                                        </p>
                                        <div className="mt-1 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-red-600">{formatPercent(item.refundRate)}</p>
                                            <p className="text-sm font-medium">{formatCurrency(item.revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                                {advanced.highRefundRateProducts.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Sem produtos com reembolso relevante.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Motivos de Reembolso</CardTitle>
                            <CardDescription>Análise avançada de recorrência</CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[320px] overflow-auto">
                            <div className="space-y-3">
                                {advanced.refundReasons.map((item) => (
                                    <div key={item.reason} className="flex items-start justify-between rounded-md border p-3">
                                        <div className="pr-4">
                                            <p className="text-sm font-medium">{item.reason}</p>
                                            <p className="text-xs text-muted-foreground">{item.count} ocorrências</p>
                                        </div>
                                        <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
                                    </div>
                                ))}
                                {advanced.refundReasons.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Sem motivos de reembolso registrados.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Pedidos Recentes</CardTitle>
                            <CardDescription>Últimos 5 pedidos realizados</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ordersIndex.url()}>Ver todos</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-sm text-muted-foreground">
                                        <th className="pb-2 font-medium">Pedido</th>
                                        <th className="pb-2 font-medium">Cliente</th>
                                        <th className="pb-2 font-medium">Status</th>
                                        <th className="pb-2 font-medium">Total</th>
                                        <th className="pb-2 font-medium">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="text-sm">
                                            <td className="py-3">
                                                <Link
                                                    href={ordersShow.url(order.id)}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {order.name}
                                                </Link>
                                            </td>
                                            <td className="py-3">
                                                {order.customer?.full_name ?? order.email}
                                            </td>
                                            <td className="py-3">
                                                <OrderStatusBadge status={order.status_id} />
                                            </td>
                                            <td className="py-3 font-medium">
                                                {formatCurrency(order.total_price)}
                                            </td>
                                            <td className="py-3 text-muted-foreground">
                                                {formatDate(order.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
