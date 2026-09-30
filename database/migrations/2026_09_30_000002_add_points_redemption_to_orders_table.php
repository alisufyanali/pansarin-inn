<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('orders', 'points_redeemed')) {
            Schema::table('orders', function (Blueprint $table) {
                // Loyalty points spent on this order; points_discount is already inside invoice_discount
                $table->unsignedInteger('points_redeemed')->default(0)->after('coupon_code');
                $table->decimal('points_discount', 10, 2)->default(0)->after('points_redeemed');
            });
        }

        // Owner decision (2026-09-30): 50 points = Rs 1 → Rs 0.02 per point.
        // Only fills an unset / disabled rate so an admin-chosen value is kept.
        $rate = DB::table('general_settings')->where('type', 'loyalty_redemption_rate')->value('value');
        if ($rate === null || (float) $rate <= 0) {
            DB::table('general_settings')->updateOrInsert(
                ['type' => 'loyalty_redemption_rate'],
                ['value' => '0.02', 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'points_redeemed')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn(['points_redeemed', 'points_discount']);
            });
        }
    }
};
