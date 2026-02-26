<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderAddress extends Model
{
    protected $fillable = [
        'order_id',
        'type',
        'first_name',
        'last_name',
        'address1',
        'address2',
        'city',
        'province',
        'province_code',
        'zip',
        'country',
        'country_code',
        'company',
        'phone',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Nome do cliente do endereço
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Formata endereço
     * @return string
     */
    public function getFormattedAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address1,
            $this->address2,
            $this->city,
            $this->province,
            $this->zip,
            $this->country,
        ]);

        return implode(', ', $parts);
    }
}
