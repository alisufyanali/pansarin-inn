<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * "Spiecs" was a misspelt duplicate of "Spices" from the category seeder.
 * Any products in it move to Spices, then it is switched off (not deleted,
 * so nothing that still points at it breaks).
 */
return new class extends Migration
{
    public function up(): void
    {
        $spiecs = DB::table('categories')->where('slug', 'spiecs')->value('id');
        if (! $spiecs) {
            return;
        }

        $spices = DB::table('categories')->where('slug', 'spices')->value('id');
        if ($spices) {
            DB::table('products')->where('category_id', $spiecs)->update(['category_id' => $spices]);
        }

        DB::table('categories')->where('id', $spiecs)->update(['status' => false, 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Products that moved to Spices stay there (they belong there).
        DB::table('categories')->where('slug', 'spiecs')->update(['status' => true, 'updated_at' => now()]);
    }
};
