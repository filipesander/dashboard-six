import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { OrderFiltersBar } from '@/components/orders/order-filters';
import { OrderTable } from '@/components/orders/order-table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as ordersIndex } from '@/routes/orders';
import type { BreadcrumbItem } from '@/types';
import type { OrderFilters, PaginatedOrders } from '@/types/order';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Pedidos', href: ordersIndex() },
];

type Props = {
    orders: PaginatedOrders;
    filters: OrderFilters;
    availableStatuses: string[];
    availablePaymentMethods: string[];
};

export default function OrdersIndex({ orders, filters, availableStatuses, availablePaymentMethods }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />
            <div className="flex flex-col gap-6 p-4">
                <Heading title="Pedidos" description="Gerencie e acompanhe todos os pedidos" />
                <OrderFiltersBar
                    filters={filters}
                    availableStatuses={availableStatuses}
                    availablePaymentMethods={availablePaymentMethods}
                />
                <OrderTable orders={orders} filters={filters} />
            </div>
        </AppLayout>
    );
}
