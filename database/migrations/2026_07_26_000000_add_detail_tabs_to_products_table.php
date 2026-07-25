<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->text('ingredients')->nullable();
            $table->text('how_to_use')->nullable();
            $table->text('benefits')->nullable();
            $table->text('key_features')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['ingredients', 'how_to_use', 'benefits', 'key_features']);
        });
    }
};
