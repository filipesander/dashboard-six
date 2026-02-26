<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('external_id')->unique();
            $table->string('order_number');
            $table->string('name');
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('status_id');
            $table->unsignedTinyInteger('financial_status');
            $table->string('fulfillment_status');
            $table->string('currency', 10)->default('USD');
            $table->string('currency_symbol', 5)->default('$');
            $table->decimal('total_price', 12, 2);
            $table->decimal('subtotal_price', 12, 2);
            $table->decimal('current_total_price', 12, 2);
            $table->decimal('total_discounts', 12, 2)->default(0);
            $table->decimal('total_tax', 12, 2)->default(0);
            $table->decimal('total_shipping', 12, 2)->default(0);
            $table->string('cancel_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('note')->nullable();
            $table->json('note_attributes')->nullable();
            $table->string('source_name')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index('order_number');
            $table->index('status_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
