<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add index on orders.order_number — used by:
 *   - GET /api/orders/track (public endpoint, high traffic)
 *   - Admin OrderController::track() search
 * Without this index every query is a full table scan.
 *
 * Note: products.slug already has a unique index from the original create migration
 * (2025_11_15_054610_create_products_table.php line 35), so no products migration is needed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! $this->hasIndex('orders', 'orders_order_number_index')) {
                $table->index('order_number', 'orders_order_number_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndexIfExists('orders_order_number_index');
        });
    }

    private function hasIndex(string $tableName, string $indexName): bool
    {
        try {
            $sm      = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes($tableName);
            return isset($indexes[$indexName]);
        } catch (\Throwable) {
            return false;
        }
    }
};
