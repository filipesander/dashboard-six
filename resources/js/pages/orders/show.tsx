import { Head } from '@inertiajs/react';
import {
    CreditCard,
    MapPin,
    Package,
    RefreshCcw,
    Truck,
    User,
} from 'lucide-react';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as ordersIndex } from '@/routes/orders';
import type { BreadcrumbItem } from '@/types';
import type { Order } from '@/types/order';

type Props = {
    order: Order;
};

function formatCurrency(value: number, symbol = '$'): string {
    return `${symbol}${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OrderShow({ order }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pedidos', href: ordersIndex() },
        { title: order.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pedido ${order.name}`} />
            <div className="flex flex-col gap-6 p-4">
                {/* Cabeçalho */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{order.name}</h1>
                        <OrderStatusBadge status={order.status_id} />
                    </div>
                </div>

                {order.cancel_reason && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Motivo do Cancelamento</p>
                        <p className="text-sm text-red-700 dark:text-red-300">{order.cancel_reason}</p>
                        {order.cancelled_at && (
                            <p className="mt-1 text-xs text-red-500">Cancelled at {formatDate(order.cancelled_at)}</p>
                        )}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Coluna Esquerda - 2/3 */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Itens do Pedido */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Itens do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b text-left text-sm text-muted-foreground">
                                                <th className="pb-2 font-medium">Produto</th>
                                                <th className="pb-2 font-medium">SKU</th>
                                                <th className="pb-2 text-center font-medium">Qtd</th>
                                                <th className="pb-2 text-right font-medium">Preço</th>
                                                <th className="pb-2 text-right font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {order.line_items?.map((item) => (
                                                <tr key={item.id} className="text-sm">
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-3">
                                                            {item.product_main_image && (
                                                                <img
                                                                    src={item.product_main_image}
                                                                    alt={item.title}
                                                                    className="h-10 w-10 rounded border object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="font-medium">{item.title}</div>
                                                                {item.variant_title && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {item.variant_title}
                                                                    </div>
                                                                )}
                                                                {item.is_refunded && (
                                                                    <Badge variant="destructive" className="mt-1 text-xs">
                                                                        Refunded
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-muted-foreground">{item.sku || '—'}</td>
                                                    <td className="py-3 text-center">{item.quantity}</td>
                                                    <td className="py-3 text-right">
                                                        {formatCurrency(item.price, order.currency_symbol)}
                                                    </td>
                                                    <td className="py-3 text-right font-medium">
                                                        {formatCurrency(item.price * item.quantity, order.currency_symbol)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex flex-col items-end gap-1 text-sm">
                                    <div className="flex w-48 justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatCurrency(order.subtotal_price, order.currency_symbol)}</span>
                                    </div>
                                    <div className="flex w-48 justify-between">
                                        <span className="text-muted-foreground">Frete</span>
                                        <span>{formatCurrency(order.total_shipping, order.currency_symbol)}</span>
                                    </div>
                                    <div className="flex w-48 justify-between">
                                        <span className="text-muted-foreground">Descontos</span>
                                        <span>-{formatCurrency(order.total_discounts, order.currency_symbol)}</span>
                                    </div>
                                    <div className="flex w-48 justify-between">
                                        <span className="text-muted-foreground">Impostos</span>
                                        <span>{formatCurrency(order.total_tax, order.currency_symbol)}</span>
                                    </div>
                                    <Separator className="my-1 w-48" />
                                    <div className="flex w-48 justify-between font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total_price, order.currency_symbol)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informações de Pagamento */}
                        {order.payment && (
                            <Card>
                                <CardHeader className="flex flex-row items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Informações de Pagamento</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Gateway</p>
                                            <p className="font-medium">{order.payment.gateway}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Método</p>
                                            <p className="font-medium capitalize">{order.payment.type}</p>
                                        </div>
                                        {order.payment.cc_brand && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Cartão</p>
                                                <p className="font-medium capitalize">
                                                    {order.payment.cc_brand}{' '}
                                                    {order.payment.cc_last_four && `**** ${order.payment.cc_last_four}`}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-muted-foreground">Valor</p>
                                            <p className="font-medium">
                                                {formatCurrency(order.payment.amount, order.currency_symbol)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Histórico de Envio */}
                        {order.fulfillments && order.fulfillments.length > 0 && (
                            <Card>
                                <CardHeader className="flex flex-row items-center gap-2">
                                    <Truck className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Histórico de Envio</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.fulfillments.map((ful) => (
                                            <div
                                                key={ful.id}
                                                className="flex items-start gap-3 rounded-lg border p-3"
                                            >
                                                <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium">
                                                            {ful.tracking_company ?? 'Envio'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(ful.created_at)}
                                                        </p>
                                                    </div>
                                                    {ful.tracking_number && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Rastreio: {ful.tracking_number}
                                                        </p>
                                                    )}
                                                    {ful.tracking_url && (
                                                        <a
                                                            href={ful.tracking_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary hover:underline"
                                                        >
                                                            Rastrear Pacote
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reembolsos */}
                        {order.refunds && order.refunds.length > 0 && (
                            <Card>
                                <CardHeader className="flex flex-row items-center gap-2">
                                    <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Reembolsos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.refunds.map((refund) => (
                                            <div
                                                key={refund.id}
                                                className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                                        {formatCurrency(refund.total_amount, order.currency_symbol)}
                                                    </p>
                                                    <p className="text-xs text-red-500">
                                                        {formatDate(refund.refunded_at)}
                                                    </p>
                                                </div>
                                                {refund.note && (
                                                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                                        {refund.note}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Coluna Direita - 1/3 */}
                    <div className="flex flex-col gap-6">
                        {/* Cliente */}
                        {order.customer && (
                            <Card>
                                <CardHeader className="flex flex-row items-center gap-2">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Cliente</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-medium">{order.customer.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                                    {order.customer.phone && (
                                        <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Endereço de Entrega */}
                        {order.shipping_address && (
                            <Card>
                                <CardHeader className="flex flex-row items-center gap-2">
                                    <Truck className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Endereço de Entrega</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 text-sm">
                                    <p className="font-medium">
                                        {order.shipping_address.first_name} {order.shipping_address.last_name}
                                    </p>
                                    <p>{order.shipping_address.address1}</p>
                                    {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                                    <p>
                                        {order.shipping_address.city}
                                        {order.shipping_address.province && `, ${order.shipping_address.province}`}{' '}
                                        {order.shipping_address.zip}
                                    </p>
                                    <p>{order.shipping_address.country}</p>
                                    {order.shipping_address.phone && (
                                        <p className="text-muted-foreground">{order.shipping_address.phone}</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Endereço de Cobrança */}
                        {order.billing_address && (
                            <Card>
                                <CardHeader className="flex flex-row items-center gap-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Endereço de Cobrança</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 text-sm">
                                    <p className="font-medium">
                                        {order.billing_address.first_name} {order.billing_address.last_name}
                                    </p>
                                    <p>{order.billing_address.address1}</p>
                                    {order.billing_address.address2 && <p>{order.billing_address.address2}</p>}
                                    <p>
                                        {order.billing_address.city}
                                        {order.billing_address.province && `, ${order.billing_address.province}`}{' '}
                                        {order.billing_address.zip}
                                    </p>
                                    <p>{order.billing_address.country}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Detalhes do Pedido */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalhes do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Número do Pedido</span>
                                    <span className="font-medium">{order.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Moeda</span>
                                    <span>{order.currency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Criado em</span>
                                    <span>{formatDate(order.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Atualizado em</span>
                                    <span>{formatDate(order.updated_at)}</span>
                                </div>
                                {order.note && (
                                    <div className="pt-2">
                                        <p className="text-muted-foreground">Observações</p>
                                        <p className="mt-1 rounded bg-muted p-2">{order.note}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
