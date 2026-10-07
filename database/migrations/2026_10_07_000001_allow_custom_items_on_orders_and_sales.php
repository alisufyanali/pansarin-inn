<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Custom items (owner request 2026-10-07): a customer phones in for something
 * we do not stock and we buy it from outside. The admin types its name, size
 * and price on the order / sale — it is not a catalog product and never
 * touches inventory, so the line has no product_id. Its name and size live in
 * meta (product_name / variant_name, meta.custom = true).
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (['order_items', 'sale_items'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->unsignedBigInteger('product_id')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        // Lines without a product cannot satisfy NOT NULL — leave them nullable then.
        foreach (['order_items', 'sale_items'] as $table) {
            if (\Illuminate\Support\Facades\DB::table($table)->whereNull('product_id')->exists()) {
                continue;
            }
            Schema::table($table, function (Blueprint $t) {
                $t->unsignedBigInteger('product_id')->nullable(false)->change();
            });
        }
    }
};
