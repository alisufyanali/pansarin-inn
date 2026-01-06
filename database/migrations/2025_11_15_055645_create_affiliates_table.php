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
        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('affiliate_code')->unique();
            $table->unsignedBigInteger('parent_id')->nullable(); // Referral Affiliate (parent)
            $table->foreign('parent_id')->references('id')->on('affiliates')->onDelete('set null');
            $table->decimal('commission_rate', 5, 2)->default(5.00); // Default 5%
            $table->decimal('balance', 10, 2)->default(0.00); // Current earning
            $table->string('payment_method')->nullable(); // Bank, JazzCash, Easypaisa
            $table->string('payment_account_title')->nullable(); // Account Title
            $table->string('payment_iban_details')->nullable(); // Account IBAN number for reduce risk
            $table->text('payment_account_no_details')->nullable(); // Account number
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affiliates');
    }
};