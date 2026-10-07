<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->integer('points'); // Positive (+) for earn, Negative (-) for redeem
            $table->enum('type', ['earned', 'redeemed', 'admin_adjustment'])->default('earned');
            $table->string('reason'); // e.g., 'purchase', 'referral', 'signup_bonus'
            $table->string('reference')->nullable()->comment('e.g. order number or admin note');
            $table->timestamps();

            $table->index('customer_id', 'point_transactions_customer_id_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};
