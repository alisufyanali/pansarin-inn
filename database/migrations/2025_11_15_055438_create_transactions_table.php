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
        Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('order_id');
    $table->decimal('amount', 10, 2);
    $table->string('method'); // COD, JazzCash, Easypaisa, Bank
    $table->string('transaction_id')->nullable();
    $table->enum('status', ['pending','success','failed'])->default('pending');
    $table->timestamps();

    $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
