import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index as ordersIndex } from '@/routes/orders';
import type { OrderFilters } from '@/types/order';

type Props = {
    filters: OrderFilters;
    availableStatuses: string[];
    availablePaymentMethods: string[];
};

export function OrderFiltersBar({ filters, availableStatuses, availablePaymentMethods }: Props) {
    const [search, setSearch] = useState(filters.search);
    const normalizedStatuses = availableStatuses.filter((status) => status.trim().length > 0);
    const normalizedPaymentMethods = availablePaymentMethods.filter((method) => method.trim().length > 0);

    const applyFilters = useCallback(
        (newFilters: Partial<OrderFilters>) => {
            const merged = { ...filters, ...newFilters };

            const params: Record<string, string> = {};
            for (const [key, value] of Object.entries(merged)) {
                if (value) params[key] = value;
            }

            router.get(ordersIndex.url(), params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [filters],
    );

    const clearFilters = useCallback(() => {
        setSearch('');
        router.get(ordersIndex.url(), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    const hasActiveFilters = filters.search || filters.status || filters.date_from || filters.date_to || filters.payment_method;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
                <Input
                    placeholder="Buscar por nº do pedido, cliente, e-mail..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            applyFilters({ search });
                        }
                    }}
                    onBlur={() => {
                        if (search !== filters.search) {
                            applyFilters({ search });
                        }
                    }}
                />
            </div>
            <Select
                value={filters.status || 'all'}
                onValueChange={(value) => applyFilters({ status: value === 'all' ? '' : value })}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {normalizedStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                            {status}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                value={filters.payment_method || 'all'}
                onValueChange={(value) => applyFilters({ payment_method: value === 'all' ? '' : value })}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Métodos</SelectItem>
                    {normalizedPaymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                type="date"
                className="w-[160px]"
                value={filters.date_from}
                onChange={(e) => applyFilters({ date_from: e.target.value })}
            />
            <Input
                type="date"
                className="w-[160px]"
                value={filters.date_to}
                onChange={(e) => applyFilters({ date_to: e.target.value })}
            />
            {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
