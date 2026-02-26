<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Helpers\OrderCache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class OrderImportService
{
    
    /**
     * Importa os pedidos da API do GrupoSix e salvar no banco local
     * @return int
     */
    public function import(): int
    {
        $response = Http::timeout(30)->get(config('services.orders_api.url'));

        if (! $response->successful()) {
            throw new \RuntimeException("API request failed with status {$response->status()}");
        }

        $ordersData = $response->json('orders', []);
        $importedCount = 0;

        foreach ($ordersData as $orderWrapper) {
            $data = $orderWrapper['order'];

            DB::transaction(function () use ($data, &$importedCount) {
                $customer = $this->upsertCustomer($data['customer']);
                $order = $this->upsertOrder($data, $customer);
                $this->syncLineItems($order, $data['line_items'] ?? []);
                $this->syncPayment($order, $data['payment'] ?? null);
                $this->syncAddresses($order, $data);
                $this->syncFulfillments($order, $data['fulfillments'] ?? []);
                $this->syncRefunds($order, $data['refunds'] ?? []);
                $importedCount++;
            });
        }

        if ($importedCount > 0) {
            OrderCache::bump();
        }

        return $importedCount;
    }

    /**
     * Cria ou atualiza o cliente relacionado ao pedido
     * @return Customer
     */
    private function upsertCustomer(array $data): Customer
    {
        return Customer::updateOrCreate(
            ['external_id' => $data['id']],
            [
                'email' => $data['email'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => $data['phone'] ?? null,
                'accepts_marketing' => (bool) ($data['accepts_marketing'] ?? false),
            ]
        );
    }

    /**
     * Cria ou atualiza os dados principais do pedido
     * @return Order
     */
    private function upsertOrder(array $data, Customer $customer): Order
    {
        $orderData = [
            'order_number' => $data['order_number'],
            'name' => $data['name'],
            'customer_id' => $customer->id,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'status_id' => $data['status_id'],
            'financial_status' => $data['financial_status'],
            'fulfillment_status' => $data['fulfillment_status'],
            'currency' => $data['currency'],
            'currency_symbol' => $data['currency_symbol'],
            'presentment_currency' => $data['presentment_currency'] ?? 'R$',
            'local_currency_amount' => $this->parsePrice($data['local_currency_amount'] ?? 0),
            'total_price' => $this->parsePrice($data['total_price']),
            'subtotal_price' => $this->parsePrice($data['subtotal_price']),
            'current_total_price' => $this->parsePrice($data['current_total_price']),
            'total_discounts' => $this->parsePrice($data['total_discounts'] ?? '0'),
            'total_tax' => $this->parsePrice($data['total_tax'] ?? '0'),
            'total_shipping' => $this->parsePrice($data['shipping_lines']['price'] ?? 0),
            'cancel_reason' => $data['cancel_reason'] ?: null,
            'cancelled_at' => $data['cancelled_at'],
            'note' => $data['note'] ?: null,
            'note_attributes' => ! empty($data['note_attributes']) ? $data['note_attributes'] : null,
            'source_name' => $data['source_name'] ?? null,
            'processed_at' => $data['processed_at'] ?? null,
            'closed_at' => $data['closed_at'],
        ];

        $existingOrder = Order::where('external_id', $data['id'])->first();
        if ($existingOrder && $existingOrder->status_id === 'Cancelled') {
            $orderData['status_id'] = 'Cancelled';
            $orderData['cancel_reason'] = $existingOrder->cancel_reason;
            $orderData['cancelled_at'] = $existingOrder->cancelled_at;
        }

        $order = Order::updateOrCreate(
            ['external_id' => $data['id']],
            $orderData
        );

        $order->timestamps = false;
        $order->created_at = $data['created_at'];
        $order->updated_at = $data['updated_at'];
        $order->save();

        return $order;
    }

    /**
     * Sincroniza os itens do pedido
     * @return void
     */
    private function syncLineItems(Order $order, array $items): void
    {
        $order->lineItems()->delete();

        foreach ($items as $item) {
            $order->lineItems()->create([
                'external_id' => $item['id'],
                'title' => $item['title'],
                'name' => $item['name'],
                'sku' => $item['sku'] ?? null,
                'price' => $this->parsePrice($item['price']),
                'quantity' => $item['quantity'],
                'variant_title' => $item['variant_title'] ?? null,
                'product_main_image' => $item['product_main_image'] ?? null,
                'product_id' => $item['product_id'] ?? null,
                'variant_id' => $item['variant_id'] ?? null,
                'requires_shipping' => (bool) ($item['requires_shipping'] ?? true),
                'is_refunded' => (bool) ($item['is_refunded'] ?? false),
                'refunded_quantity' => $item['refunded_quantity'] ?? 0,
                'total_discount' => $this->parsePrice($item['total_discount'] ?? 0),
            ]);
        }
    }

    /**
     * Sincroniza os dados de pagamento do pedido
     * @return void
     */
    private function syncPayment(Order $order, ?array $data): void
    {
        if (! $data) {
            return;
        }

        $order->payment()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'external_id' => $data['id'] ?? null,
                'gateway' => $data['gateway'],
                'type' => $data['type'],
                'status_id' => $data['status_id'],
                'amount' => $this->parsePrice($data['amount']),
                'cc_brand' => $data['cc_brand'] ?? null,
                'cc_last_four' => $data['cc_last_four'] ?? null,
                'cc_name' => $data['cc_name'] ?? null,
            ]
        );
    }

    /**
     * Sincroniza os endereços de cobrança e entrega do pedido
     * @return void
     */
    private function syncAddresses(Order $order, array $data): void
    {
        $order->addresses()->delete();

        foreach (['billing_address' => 'billing', 'shipping_address' => 'shipping'] as $key => $type) {
            if (! empty($data[$key])) {
                $addr = $data[$key];
                $order->addresses()->create([
                    'type' => $type,
                    'first_name' => $addr['first_name'],
                    'last_name' => $addr['last_name'],
                    'address1' => $addr['address1'],
                    'address2' => $addr['address2'] ?: null,
                    'city' => $addr['city'],
                    'province' => $addr['province'] ?? null,
                    'province_code' => $addr['province_code'] ?? null,
                    'zip' => $addr['zip'] ?? null,
                    'country' => $addr['country'],
                    'country_code' => $addr['country_code'] ?? null,
                    'company' => $addr['company'] ?: null,
                    'phone' => $addr['phone'] ?? null,
                ]);
            }
        }
    }

    /**
     * Sincroniza os dados de fulfillment do pedido
     * @return void
     */
    private function syncFulfillments(Order $order, array $fulfillments): void
    {
        $order->fulfillments()->delete();

        foreach ($fulfillments as $ful) {
            $order->fulfillments()->create([
                'external_id' => $ful['id'],
                'tracking_company' => $ful['tracking_company'] ?? null,
                'tracking_number' => $ful['tracking_number'] ?? null,
                'tracking_url' => $ful['tracking_url'] ?? null,
                'status' => $ful['status'] ?? 0,
                'created_at' => $ful['created_at'],
                'updated_at' => $ful['updated_at'],
            ]);
        }
    }

    /**
     * Sincroniza os reembolsos do pedido
     * @return void
     */
    private function syncRefunds(Order $order, array $refunds): void
    {
        $order->refunds()->delete();

        foreach ($refunds as $refund) {
            $order->refunds()->create([
                'external_id' => $refund['id'],
                'note' => $refund['note'] ?? null,
                'total_amount' => $this->parsePrice($refund['total_amount']),
                'status_id' => $refund['status_id'],
                'refunded_at' => $refund['created_at'] ?? null,
            ]);
        }
    }

    /**
     * Formata preço
     * @param mixed $value
     * @return float
     */
    private function parsePrice(mixed $value): float
    {
        if (is_numeric($value)) {
            return (float) $value;
        }

        return (float) str_replace(',', '', (string) $value);
    }
}
