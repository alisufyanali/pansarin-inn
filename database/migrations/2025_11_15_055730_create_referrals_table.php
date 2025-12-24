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
        Schema::create('referrals', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('affiliate_id');
    $table->unsignedBigInteger('order_id')->nullable();
    $table->unsignedBigInteger('user_id')->nullable();
    $table->decimal('commission', 10, 2)->default(0);
    $table->timestamps();

    $table->foreign('affiliate_id')->references('id')->on('affiliates')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
