<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Default loyalty redemption rate. The orders.points_redeemed / points_discount
 * columns are in the orders create migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Owner decision (2026-10-10): 1 point = Rs 1 (was 50 points = Rs 1 on 2026-09-30).
        // Only fills an unset / disabled rate so an admin-chosen value is kept.
        $rate = DB::table('general_settings')->where('type', 'loyalty_redemption_rate')->value('value');
        if ($rate === null || (float) $rate <= 0) {
            DB::table('general_settings')->updateOrInsert(
                ['type' => 'loyalty_redemption_rate'],
                ['value' => '1', 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    public function down(): void
    {
        // Leave the setting: an admin may have changed it since
    }
};
