<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->string('order_number')->unique();
        $table->decimal('subtotal', 12, 2)->default(0);
        $table->decimal('shipping', 12, 2)->default(0);
        $table->decimal('tax', 12, 2)->default(0);
        $table->decimal('total', 12, 2)->default(0);
        $table->enum('status', ['pending','processing','shipped','delivered','cancelled','refunded'])->default('pending');
        $table->string('shipping_address')->nullable();
        $table->string('billing_address')->nullable();
        $table->string('payment_method')->nullable();
        $table->string('payment_status')->default('unpaid');
        $table->timestamps();
        $table->softDeletes();
        $table->index('order_number');
        $table->index(['user_id','status']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
