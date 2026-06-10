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
        Schema::create('affiliate_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->decimal('order_subtotal', 12, 2);
            $table->decimal('order_grand_total', 12, 2);
            $table->decimal('commission_percentage', 5, 2);
            $table->decimal('commission_amount', 12, 2);
            $table->enum('status', ['pending', 'earned', 'cancelled'])->default('pending');
            $table->timestamps();

            // Ek order ka commission ek hi baar banna chahiye
            $table->unique(['affiliate_id', 'order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affiliate_commissions');
    }
};
