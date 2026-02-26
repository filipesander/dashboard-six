import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/order';

const statusConfig: Record<
    OrderStatus,
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
    Fulfilled: { variant: 'default', className: 'bg-green-600 hover:bg-green-600/90' },
    Unfulfilled: { variant: 'outline' },
    'Partially Fulfilled': { variant: 'secondary' },
    Refunded: { variant: 'destructive' },
    Cancelled: { variant: 'destructive', className: 'bg-red-800 hover:bg-red-800/90' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const config = statusConfig[status] ?? { variant: 'outline' as const };

    return (
        <Badge variant={config.variant} className={config.className}>
            {status}
        </Badge>
    );
}
