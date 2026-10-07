<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Storefront category order ("Shop By Category", shop filters), set by the
 * owner (2026-10-01). Lower comes first; categories not listed go last (99).
 * The sort_order column itself is in the categories create migration.
 */
return new class extends Migration
{
    private const ORDER = [
        'herb', 'seeds', 'spices', 'dry-fruits', 'oils', 'supplements',
        'herbal-tea', 'remedies', 'dawakhana', 'combo-deals',
    ];

    public function up(): void
    {
        foreach (self::ORDER as $i => $slug) {
            DB::table('categories')->where('slug', $slug)->update(['sort_order' => $i + 1]);
        }

        // Owner's wording: "Herbs" (URL /herb stays the same)
        DB::table('categories')->where('slug', 'herb')->where('name', 'Herb')->update(['name' => 'Herbs']);
    }

    public function down(): void
    {
        DB::table('categories')->where('slug', 'herb')->where('name', 'Herbs')->update(['name' => 'Herb']);
        DB::table('categories')->update(['sort_order' => 99]);
    }
};
