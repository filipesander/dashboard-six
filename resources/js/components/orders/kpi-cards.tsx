import {
    BadgeDollarSign,
    PackageCheck,
    PackageX,
    ShoppingCart,
    Star,
    Ticket,
    Users,
    Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardKpis } from '@/types/order';

function formatCurrency(value: number, currency: 'USD' | 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
    }).format(value);
}

function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}

function refundRateTone(value: number): string {
    if (value >= 20) return 'text-red-600';
    if (value >= 10) return 'text-amber-600';
    return 'text-emerald-600';
}

export function KpiCards({ kpis }: { kpis: DashboardKpis }) {
    const num = (value: number | undefined | null): number => Number(value ?? 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{num(kpis.totalOrders)}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
                    <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                    <p className="text-lg font-semibold">{formatCurrency(num(kpis.totalRevenueUsd), 'USD')}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(num(kpis.totalRevenueBrl), 'BRL')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Entregues</CardTitle>
                    <PackageCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                    <p className="text-2xl font-bold">{num(kpis.deliveredOrders)}</p>
                    <p className="text-sm text-muted-foreground">Taxa: {formatPercent(num(kpis.deliveredRate))}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Únicos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                    <p className="text-2xl font-bold">{num(kpis.uniqueCustomers)}</p>
                    <p className="text-sm text-muted-foreground">
                        {num(kpis.avgOrdersPerCustomer).toFixed(2)} pedidos por cliente
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Resumo Financeiro</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                    <p className="text-sm">Bruto: {formatCurrency(num(kpis.grossRevenue), 'USD')}</p>
                    <p className="text-sm">Reembolsos: {formatCurrency(num(kpis.refundAmount), 'USD')}</p>
                    <p className="text-sm font-semibold">Líquido: {formatCurrency(num(kpis.netRevenue), 'USD')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Reembolso</CardTitle>
                    <PackageX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className={`text-2xl font-bold ${refundRateTone(num(kpis.refundRate))}`}>
                        {formatPercent(num(kpis.refundRate))}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Produto Mais Vendido</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                    <p className="truncate text-sm font-semibold">{kpis.topProduct?.name ?? 'Sem dados'}</p>
                    <p className="text-sm text-muted-foreground">Qtd: {num(kpis.topProduct?.quantity)}</p>
                    <p className="text-sm text-muted-foreground">
                        Receita: {formatCurrency(num(kpis.topProduct?.revenue), 'USD')}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(num(kpis.averageTicket), 'USD')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
