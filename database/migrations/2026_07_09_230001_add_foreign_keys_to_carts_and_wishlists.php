<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Clean orphan rows first so FK constraints don't fail ──
        DB::statement('DELETE FROM carts WHERE user_id NOT IN (SELECT id FROM users)');
        DB::statement('DELETE FROM carts WHERE product_variant_id NOT IN (SELECT id FROM product_variants)');
        DB::statement('DELETE FROM wishlists WHERE user_id NOT IN (SELECT id FROM users)');
        DB::statement('DELETE FROM wishlists WHERE product_id NOT IN (SELECT id FROM products)');

        // ── carts ─────────────────────────────────────────────────
        Schema::table('carts', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('product_variant_id');
            $table->foreign('user_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');
            $table->foreign('product_variant_id')
                  ->references('id')->on('product_variants')
                  ->onDelete('cascade');
        });

        // ── wishlists ─────────────────────────────────────────────
        Schema::table('wishlists', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('product_id');
            $table->foreign('user_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');
            $table->foreign('product_id')
                  ->references('id')->on('products')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['product_variant_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['product_variant_id']);
        });

        Schema::table('wishlists', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['product_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['product_id']);
        });
    }
};
