import { Link, router } from '@inertiajs/react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { show as ordersShow } from '@/routes/orders';
import { index as ordersIndex } from '@/routes/orders';
import type { Order, OrderFilters, PaginatedOrders } from '@/types/order';
import { OrderStatusBadge } from './order-status-badge';

type Props = {
    orders: PaginatedOrders;
    filters: OrderFilters;
};

type SortHeaderProps = {
    column: string;
    children: ReactNode;
    onSort: (column: string) => void;
};

function formatCurrency(value: number, symbol = '$'): string {
    return `${symbol}${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function SortHeader({ column, children, onSort }: SortHeaderProps) {
    return (
        <th
            className="cursor-pointer px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => onSort(column)}
        >
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown className="h-3 w-3" />
            </div>
        </th>
    );
}

export function OrderTable({ orders, filters }: Props) {
    const handleSort = useCallback(
        (column: string) => {
            const direction = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
            const params: Record<string, string> = { ...filters, sort: column, direction };

            for (const key of Object.keys(params)) {
                if (!params[key]) delete params[key];
            }

            router.get(ordersIndex.url(), params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [filters],
    );

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                            <SortHeader column="name" onSort={handleSort}>Pedido</SortHeader>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                            <SortHeader column="status_id" onSort={handleSort}>Status</SortHeader>
                            <SortHeader column="total_price" onSort={handleSort}>Total</SortHeader>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Pagamento</th>
                            <SortHeader column="created_at" onSort={handleSort}>Data</SortHeader>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    Nenhum pedido encontrado.
                                </td>
                            </tr>
                        ) : (
                            orders.data.map((order: Order) => (
                                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                                        {order.id}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={ordersShow.url(order.id)}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {order.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {order.customer ? (
                                            <div>
                                                <div>{order.customer.full_name}</div>
                                                <div className="text-muted-foreground">{order.customer.email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">{order.email}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <OrderStatusBadge status={order.status_id} />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">
                                        {formatCurrency(order.total_price, order.currency_symbol)}
                                    </td>
                                    <td className="px-4 py-3 text-sm capitalize">
                                        {order.payment?.cc_brand ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {formatDate(order.created_at)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {orders.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Exibindo {(orders.current_page - 1) * orders.per_page + 1} a{' '}
                        {Math.min(orders.current_page * orders.per_page, orders.total)} de {orders.total} pedidos
                    </p>
                    <div className="flex items-center gap-2">
                        {orders.links.map((link, i) => {
                            if (i === 0) {
                                return (
                                    <Button key="prev" variant="outline" size="sm" disabled={!link.url} asChild={!!link.url}>
                                        {link.url ? (
                                            <Link href={link.url} preserveState preserveScroll>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <span><ChevronLeft className="h-4 w-4" /></span>
                                        )}
                                    </Button>
                                );
                            }
                            if (i === orders.links.length - 1) {
                                return (
                                    <Button key="next" variant="outline" size="sm" disabled={!link.url} asChild={!!link.url}>
                                        {link.url ? (
                                            <Link href={link.url} preserveState preserveScroll>
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <span><ChevronRight className="h-4 w-4" /></span>
                                        )}
                                    </Button>
                                );
                            }
                            return (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url} preserveState preserveScroll>
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
