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
            // Null for a custom item bought in from outside (name/size in meta)
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('cascade');
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->onDelete('cascade');
            $table->foreignId('deal_id')->nullable()->constrained('deals')->nullOnDelete();

            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('price', 12, 2)->default(0); // Unit price
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0); // Discount on this item
            $table->decimal('subtotal', 12, 2)->default(0); // (price * quantity) - discount

            // Store product snapshot at time of order
            $table->json('meta')->nullable(); // {product_name, sku, variant_name, options, etc}

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['order_id', 'product_id']);
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
