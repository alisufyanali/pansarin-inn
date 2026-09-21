<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropUnique('customers_email_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('customer_id');
            $table->string('customer_phone', 20)->nullable()->after('customer_name');
            $table->string('customer_email')->nullable()->after('customer_phone');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('customer_id');
            $table->string('customer_phone', 20)->nullable()->after('customer_name');
            $table->string('customer_email')->nullable()->after('customer_phone');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'customer_phone', 'customer_email']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'customer_phone', 'customer_email']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->unique('email', 'customers_email_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unique('email');
        });
    }
};
