<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderLineItem extends Model
{
    protected $fillable = [
        'order_id',
        'external_id',
        'title',
        'name',
        'sku',
        'price',
        'quantity',
        'variant_title',
        'product_main_image',
        'product_id',
        'variant_id',
        'requires_shipping',
        'is_refunded',
        'refunded_quantity',
        'total_discount',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'total_discount' => 'decimal:2',
            'requires_shipping' => 'boolean',
            'is_refunded' => 'boolean',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Calcula o valor total do item
     * @return float
     */
    public function getTotalPriceAttribute(): float
    {
        return $this->price * $this->quantity;
    }
}
