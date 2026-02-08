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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->string('sale_code')->unique(); // Order code se generate hoga
            
            // Amounts
            $table->decimal('subtotal', 12, 2)->default(0); // Total before any discounts
            $table->decimal('product_discount', 12, 2)->default(0); // Discount on products
            $table->decimal('invoice_discount', 12, 2)->default(0); // Overall invoice discount
            $table->decimal('vat', 12, 2)->default(0);
            $table->string('vat_percent')->nullable(); // e.g., "18%"
            $table->decimal('shipping_charges', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0); // Final amount
            
            // Sale Details
            $table->enum('delivery_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])->default('pending');
            $table->text('remarks')->nullable();
            $table->text('review')->nullable();
            $table->boolean('viewed')->default(false);
            
            // Shipping Details
            $table->text('shipping_address')->nullable();
            $table->string('shipping_method')->nullable(); // e.g., leopard, tcs, etc.
            $table->text('shipping_response')->nullable(); // Response from shipping API
            $table->dateTime('delivery_datetime')->nullable();
            
            // Payment Details
            $table->string('payment_type')->nullable(); // e.g., cash_on_delivery, card, etc.
            $table->enum('payment_status', ['unpaid', 'paid', 'partially_paid', 'refunded'])->default('unpaid');
            $table->text('payment_details')->nullable(); // JSON encoded payment info
            $table->timestamp('payment_timestamp')->nullable();
            
            // Sale DateTime
            $table->timestamp('sale_datetime')->nullable();
            
            // Active Status
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('sale_code');
            $table->index('order_id');
            $table->index(['customer_id', 'delivery_status']);
            $table->index('payment_status');
            $table->index('sale_datetime');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};