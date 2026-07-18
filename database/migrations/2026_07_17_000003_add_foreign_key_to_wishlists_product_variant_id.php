<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Add a proper FK constraint on wishlists.product_variant_id.
 *
 * The column already exists as a raw unsignedBigInteger with no FK.
 * onDelete('set null') ensures that if a ProductVariant is deleted,
 * the wishlist row survives with product_variant_id reset to null
 * rather than leaving an orphaned reference or cascading a delete.
 *
 * Pre-flight: null out any stale variant IDs that no longer exist
 * in product_variants, so the FK creation doesn't fail.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Null out orphaned variant references before adding the FK constraint
        DB::statement('
            UPDATE wishlists
            SET product_variant_id = NULL
            WHERE product_variant_id IS NOT NULL
              AND product_variant_id NOT IN (SELECT id FROM product_variants)
        ');

        Schema::table('wishlists', function (Blueprint $table) {
            $table->index('product_variant_id', 'wishlists_product_variant_id_index');

            $table->foreign('product_variant_id', 'wishlists_product_variant_id_foreign')
                  ->references('id')
                  ->on('product_variants')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('wishlists', function (Blueprint $table) {
            $table->dropForeign('wishlists_product_variant_id_foreign');
            $table->dropIndex('wishlists_product_variant_id_index');
        });
    }
};
