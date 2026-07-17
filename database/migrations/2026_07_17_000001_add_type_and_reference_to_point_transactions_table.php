<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Extend point_transactions with:
 *   - type: earned | redeemed | admin_adjustment
 *   - reference: optional order_number or admin note
 *   - index on customer_id for fast history queries
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->enum('type', ['earned', 'redeemed', 'admin_adjustment'])
                  ->default('earned')
                  ->after('points');

            $table->string('reference')->nullable()
                  ->after('reason')
                  ->comment('e.g. order number or admin note');

            // Index for fast per-customer history lookups
            if (! $this->hasIndex('point_transactions', 'point_transactions_customer_id_index')) {
                $table->index('customer_id', 'point_transactions_customer_id_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->dropColumn(['type', 'reference']);
            $table->dropIndexIfExists('point_transactions_customer_id_index');
        });
    }

    private function hasIndex(string $table, string $index): bool
    {
        try {
            $indexes = Schema::getConnection()->getDoctrineSchemaManager()->listTableIndexes($table);
            return isset($indexes[$index]);
        } catch (\Throwable) {
            return false;
        }
    }
};
