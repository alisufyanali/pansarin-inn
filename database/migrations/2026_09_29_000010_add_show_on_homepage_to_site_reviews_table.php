<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('site_reviews', 'show_on_homepage')) {
            return;
        }

        Schema::table('site_reviews', function (Blueprint $table) {
            // Admin picks which approved customer reviews appear on the storefront homepage.
            $table->boolean('show_on_homepage')->default(false)->after('status');
            $table->index(['status', 'show_on_homepage']);
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('site_reviews', 'show_on_homepage')) {
            return;
        }

        Schema::table('site_reviews', function (Blueprint $table) {
            $table->dropIndex(['status', 'show_on_homepage']);
            $table->dropColumn('show_on_homepage');
        });
    }
};
