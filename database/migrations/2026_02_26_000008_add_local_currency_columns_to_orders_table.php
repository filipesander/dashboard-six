<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('presentment_currency', 10)->default('R$')->after('currency_symbol');
            $table->decimal('local_currency_amount', 12, 2)->default(0)->after('presentment_currency');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['presentment_currency', 'local_currency_amount']);
        });
    }
};
