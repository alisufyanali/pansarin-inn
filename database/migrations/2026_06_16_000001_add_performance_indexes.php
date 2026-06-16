<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Performance indexes for dashboard stats queries.
 * Covers: orders.status, orders.payment_status, orders.grand_total,
 *         sales.delivery_status, sales.payment_status, sales.grand_total,
 *         products.status, products.featured, products.sale_price,
 *         product_stocks.product_id + product_variant_id (composite).
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── Orders ────────────────────────────────────────────────
        Schema::table('orders', function (Blueprint $table) {
            if (!$this->hasIndex('orders', 'orders_status_index')) {
                $table->index('status', 'orders_status_index');
            }
            if (!$this->hasIndex('orders', 'orders_payment_status_index')) {
                $table->index('payment_status', 'orders_payment_status_index');
            }
            if (!$this->hasIndex('orders', 'orders_customer_id_index')) {
                $table->index('customer_id', 'orders_customer_id_index');
            }
        });

        // ── Sales ─────────────────────────────────────────────────
        Schema::table('sales', function (Blueprint $table) {
            if (!$this->hasIndex('sales', 'sales_delivery_status_index')) {
                $table->index('delivery_status', 'sales_delivery_status_index');
            }
            if (!$this->hasIndex('sales', 'sales_payment_status_index')) {
                $table->index('payment_status', 'sales_payment_status_index');
            }
            if (!$this->hasIndex('sales', 'sales_customer_id_index')) {
                $table->index('customer_id', 'sales_customer_id_index');
            }
        });

        // ── Products ──────────────────────────────────────────────
        Schema::table('products', function (Blueprint $table) {
            if (!$this->hasIndex('products', 'products_status_featured_index')) {
                $table->index(['status', 'featured'], 'products_status_featured_index');
            }
        });

        // ── Product Stocks ────────────────────────────────────────
        Schema::table('product_stocks', function (Blueprint $table) {
            if (!$this->hasIndex('product_stocks', 'product_stocks_product_variant_index')) {
                $table->index(['product_id', 'product_variant_id'], 'product_stocks_product_variant_index');
            }
        });

        // ── Inventory ─────────────────────────────────────────────
        Schema::table('inventories', function (Blueprint $table) {
            if (!$this->hasIndex('inventories', 'inventories_product_variant_index')) {
                $table->index(['product_id', 'product_variant_id'], 'inventories_product_variant_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders',         fn (Blueprint $t) => $t->dropIndexIfExists('orders_status_index'));
        Schema::table('orders',         fn (Blueprint $t) => $t->dropIndexIfExists('orders_payment_status_index'));
        Schema::table('orders',         fn (Blueprint $t) => $t->dropIndexIfExists('orders_customer_id_index'));
        Schema::table('sales',          fn (Blueprint $t) => $t->dropIndexIfExists('sales_delivery_status_index'));
        Schema::table('sales',          fn (Blueprint $t) => $t->dropIndexIfExists('sales_payment_status_index'));
        Schema::table('sales',          fn (Blueprint $t) => $t->dropIndexIfExists('sales_customer_id_index'));
        Schema::table('products',       fn (Blueprint $t) => $t->dropIndexIfExists('products_status_featured_index'));
        Schema::table('product_stocks', fn (Blueprint $t) => $t->dropIndexIfExists('product_stocks_product_variant_index'));
        Schema::table('inventories',    fn (Blueprint $t) => $t->dropIndexIfExists('inventories_product_variant_index'));
    }

    private function hasIndex(string $table, string $index): bool
    {
        try {
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes($table);
            return isset($indexes[$index]);
        } catch (\Throwable) {
            return false;
        }
    }
};
