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
        Schema::create('payment_settings', function (Blueprint $table) {
    $table->id();
    $table->boolean('cod')->default(true);
    $table->string('stripe_key')->nullable();
    $table->string('stripe_secret')->nullable();
    $table->string('paypal_client_id')->nullable();
    $table->string('paypal_secret')->nullable();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
