<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('deal_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            
            // Product specific deal settings (override)
            $table->decimal('custom_discount', 10, 2)->nullable();
            $table->integer('stock_limit')->nullable(); // Limited stock for this deal
            $table->integer('sold_count')->default(0);
            $table->integer('display_order')->default(0);
            
            $table->timestamps();
            
            $table->unique(['deal_id', 'product_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('deal_product');
    }
};