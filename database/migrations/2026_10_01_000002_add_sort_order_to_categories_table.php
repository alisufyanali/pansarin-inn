<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Storefront category order ("Shop By Category", shop filters), set by the
 * owner (2026-10-01). Lower comes first; categories not listed go last (99).
 */
return new class extends Migration
{
    private const ORDER = [
        'herb', 'seeds', 'spices', 'dry-fruits', 'oils', 'supplements',
        'herbal-tea', 'remedies', 'dawakhana', 'combo-deals',
    ];

    public function up(): void
    {
        if (! Schema::hasColumn('categories', 'sort_order')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->unsignedSmallInteger('sort_order')->default(99)->after('status');
            });
        }

        foreach (self::ORDER as $i => $slug) {
            DB::table('categories')->where('slug', $slug)->update(['sort_order' => $i + 1]);
        }

        // Owner's wording: "Herbs" (URL /herb stays the same)
        DB::table('categories')->where('slug', 'herb')->where('name', 'Herb')->update(['name' => 'Herbs']);
    }

    public function down(): void
    {
        DB::table('categories')->where('slug', 'herb')->where('name', 'Herbs')->update(['name' => 'Herb']);

        if (Schema::hasColumn('categories', 'sort_order')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->dropColumn('sort_order');
            });
        }
    }
};
