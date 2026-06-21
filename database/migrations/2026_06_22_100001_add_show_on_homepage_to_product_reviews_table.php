<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->boolean('show_on_homepage')->default(false)->after('status');
            $table->index('show_on_homepage');
        });
    }

    public function down(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->dropIndex(['show_on_homepage']);
            $table->dropColumn('show_on_homepage');
        });
    }
};
