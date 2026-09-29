<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('affiliates', 'fixed_commission')) {
            Schema::table('affiliates', function (Blueprint $table) {
                // Rs paid to the affiliate per delivered referred order; null = use the default setting
                $table->decimal('fixed_commission', 10, 2)->nullable()->after('commission_rate');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('affiliates', 'fixed_commission')) {
            Schema::table('affiliates', function (Blueprint $table) {
                $table->dropColumn('fixed_commission');
            });
        }
    }
};
