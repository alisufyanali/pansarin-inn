<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('order_items', 'deal_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->foreignId('deal_id')->nullable()->after('product_variant_id')
                    ->constrained('deals')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('order_items', 'deal_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropConstrainedForeignId('deal_id');
            });
        }
    }
};
