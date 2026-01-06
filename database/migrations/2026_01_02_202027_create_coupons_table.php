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
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed']); // percent ya fixed amount
            $table->decimal('discount_value', 10, 2); // discount ki value
            $table->enum('apply_to', ['order', 'product', 'category']); // kahan apply hoga
            $table->unsignedBigInteger('product_id')->nullable(); // agar product par specific hai
            $table->unsignedBigInteger('category_id')->nullable(); // agar category par specific hai
            $table->decimal('min_purchase_amount', 10, 2)->nullable(); // minimum purchase requirement
            $table->decimal('max_discount_amount', 10, 2)->nullable(); // maximum discount cap (for percentage)
            $table->integer('usage_limit')->nullable(); // kitni dafa use ho sakta
            $table->integer('usage_count')->default(0); // kitni dafa use ho chuka
            $table->integer('per_user_limit')->nullable(); // per user kitni dafa
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};