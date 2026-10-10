<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Owner 2026-10-10: 1 point = Rs 1. Every Rs 100 spent earns 1 point, so a
 * Rs 5,000 order earns Rs 50. Moves databases still on the old default
 * (0.02 = 50 points for Rs 1); a rate the admin set to anything else is kept.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('general_settings')
            ->where('type', 'loyalty_redemption_rate')
            ->whereIn('value', ['0.02', '0.020', '.02'])
            ->update(['value' => '1', 'updated_at' => now()]);
    }

    public function down(): void
    {
        DB::table('general_settings')
            ->where('type', 'loyalty_redemption_rate')
            ->where('value', '1')
            ->update(['value' => '0.02', 'updated_at' => now()]);
    }
};
