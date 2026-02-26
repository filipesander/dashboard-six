<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'external_id',
        'order_number',
        'name',
        'customer_id',
        'email',
        'phone',
        'status_id',
        'financial_status',
        'fulfillment_status',
        'currency',
        'currency_symbol',
        'presentment_currency',
        'local_currency_amount',
        'total_price',
        'subtotal_price',
        'current_total_price',
        'total_discounts',
        'total_tax',
        'total_shipping',
        'cancel_reason',
        'cancelled_at',
        'note',
        'note_attributes',
        'source_name',
        'processed_at',
        'closed_at',
    ];

    /**
     * Define os casts dos atributos do pedido.
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'local_currency_amount' => 'decimal:2',
            'subtotal_price' => 'decimal:2',
            'current_total_price' => 'decimal:2',
            'total_discounts' => 'decimal:2',
            'total_tax' => 'decimal:2',
            'total_shipping' => 'decimal:2',
            'note_attributes' => 'array',
            'cancelled_at' => 'datetime',
            'processed_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(OrderLineItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(OrderPayment::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(OrderAddress::class);
    }

    public function billingAddress(): HasOne
    {
        return $this->hasOne(OrderAddress::class)->where('type', 'billing');
    }

    public function shippingAddress(): HasOne
    {
        return $this->hasOne(OrderAddress::class)->where('type', 'shipping');
    }

    public function fulfillments(): HasMany
    {
        return $this->hasMany(OrderFulfillment::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(OrderRefund::class);
    }

    /**
     * Filtro por ID do pedido, numero do pedido, nome ou email
     * @return void
     */
    public function scopeSearch(Builder $query, ?string $search): void
    {
        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('customer', function (Builder $q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });

                if (is_numeric($search)) {
                    $q->orWhere('id', (int) $search);
                }
            });
        }
    }

    /**
     * Filtra os pedidos por status
     * @return void
     */
    public function scopeFilterByStatus(Builder $query, ?string $status): void
    {
        if ($status) {
            $query->where('status_id', $status);
        }
    }

    /**
     * Filtra os pedidos por intervalo de data
     * @return void
     */
    public function scopeFilterByDateRange(Builder $query, ?string $from, ?string $to): void
    {
        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to . ' 23:59:59');
        }
    }

    /**
     * Filtra os pedidos por tipo do pagamento
     * @return void
     */
    public function scopeFilterByPaymentMethod(Builder $query, ?string $method): void
    {
        if ($method) {
            $query->whereHas('payment', function (Builder $q) use ($method) {
                $q->where('cc_brand', $method);
            });
        }
    }
}
