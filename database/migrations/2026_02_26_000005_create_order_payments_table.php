<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('external_id')->nullable();
            $table->string('gateway');
            $table->string('type');
            $table->unsignedTinyInteger('status_id');
            $table->decimal('amount', 12, 2);
            $table->string('cc_brand')->nullable();
            $table->string('cc_last_four', 4)->nullable();
            $table->string('cc_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_payments');
    }
};
