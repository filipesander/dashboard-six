export type Customer = {
    id: number;
    external_id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    full_name: string;
};

export type OrderAddress = {
    id: number;
    type: 'billing' | 'shipping';
    first_name: string;
    last_name: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string | null;
    province_code: string | null;
    zip: string | null;
    country: string;
    country_code: string | null;
    phone: string | null;
};

export type OrderLineItem = {
    id: number;
    external_id: number;
    title: string;
    name: string;
    sku: string | null;
    price: number;
    quantity: number;
    variant_title: string | null;
    product_main_image: string | null;
    is_refunded: boolean;
    refunded_quantity: number;
    total_discount: number;
};

export type OrderPayment = {
    id: number;
    gateway: string;
    type: string;
    status_id: number;
    amount: number;
    cc_brand: string | null;
    cc_last_four: string | null;
    cc_name: string | null;
};

export type OrderFulfillment = {
    id: number;
    external_id: number;
    tracking_company: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    status: number;
    created_at: string;
};

export type OrderRefund = {
    id: number;
    external_id: number;
    note: string | null;
    total_amount: number;
    status_id: number;
    refunded_at: string | null;
};

export type OrderStatus = 'Fulfilled' | 'Unfulfilled' | 'Partially Fulfilled' | 'Refunded' | 'Cancelled';

export type Order = {
    id: number;
    external_id: number;
    order_number: string;
    name: string;
    email: string;
    phone: string | null;
    status_id: OrderStatus;
    financial_status: number;
    fulfillment_status: string;
    currency: string;
    currency_symbol: string;
    presentment_currency: string;
    local_currency_amount: number;
    total_price: number;
    subtotal_price: number;
    current_total_price: number;
    total_discounts: number;
    total_tax: number;
    total_shipping: number;
    cancel_reason: string | null;
    cancelled_at: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    line_items?: OrderLineItem[];
    payment?: OrderPayment | null;
    billing_address?: OrderAddress | null;
    shipping_address?: OrderAddress | null;
    fulfillments?: OrderFulfillment[];
    refunds?: OrderRefund[];
};

export type OrderFilters = {
    search: string;
    status: string;
    date_from: string;
    date_to: string;
    payment_method: string;
    sort: string;
    direction: 'asc' | 'desc';
};

export type PaginatedOrders = {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export type DashboardKpis = {
    totalOrders: number;
    totalRevenueUsd: number;
    totalRevenueBrl: number;
    averageTicket: number;
    deliveredOrders: number;
    deliveredRate: number;
    uniqueCustomers: number;
    avgOrdersPerCustomer: number;
    grossRevenue: number;
    refundAmount: number;
    netRevenue: number;
    refundRate: number;
    topProduct: {
        name: string | null;
        quantity: number;
        revenue: number;
    };
};

export type ChartData = {
    ordersByStatus: Record<string, number>;
    ordersByPaymentMethod: Record<string, number>;
    revenueByDate: Array<{ date: string; revenue: number; count: number }>;
};

export type UpsellAnalysis = {
    upsellRate: number;
    upsellRevenue: number;
    avgItemsPerOrder: number;
    multiProductOrders: number;
    topCombinations: Array<{
        productA: string;
        productB: string;
        count: number;
    }>;
};

export type IntermediateMetrics = {
    topProductsByRevenue: Array<{
        name: string;
        quantity: number;
        revenue: number;
    }>;
    revenueByVariant: Array<{
        variant: string;
        quantity: number;
        revenue: number;
    }>;
    topCitiesBySales: Array<{
        city: string;
        orders: number;
        revenue: number;
    }>;
    deliveredAndRefunded: {
        deliveredOrders: number;
        refundedOrders: number;
        deliveredAndRefunded: number;
        deliveredAndRefundedRate: number;
    };
    paymentConversion: Array<{
        method: string;
        orders: number;
        conversion: number;
    }>;
    upsellAnalysis: UpsellAnalysis;
};

export type AdvancedMetrics = {
    highRefundRateProducts: Array<{
        name: string;
        ordersWithProduct: number;
        refundedOrdersWithProduct: number;
        refundRate: number;
        revenue: number;
    }>;
    refundReasons: Array<{
        reason: string;
        count: number;
        amount: number;
    }>;
};
