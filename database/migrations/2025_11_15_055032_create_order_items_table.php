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
    Schema::create('order_items', function (Blueprint $table) {
        $table->id();
        $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
        $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
        $table->unsignedInteger('quantity')->default(1);
        $table->decimal('price', 12, 2)->default(0);
        $table->decimal('subtotal', 12, 2)->default(0);
        $table->json('meta')->nullable(); // store option labels, snapshot of product name/sku etc.
        $table->timestamps();
        $table->index(['order_id','product_variant_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
