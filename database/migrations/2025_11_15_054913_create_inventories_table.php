<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();

            // ── Product / Variant reference ──
            $table->foreignId('product_id')
                ->constrained('products')
                ->onDelete('cascade');

            $table->foreignId('product_variant_id')
                ->nullable()
                ->constrained('product_variants')
                ->onDelete('cascade');

            // ── Transaction details ──
            $table->enum('type', ['in', 'out', 'adjustment', 'return'])
                ->default('in')
                ->comment('in=purchase, out=sale, adjustment=manual, return=customer return');

            $table->integer('quantity')
                ->comment('Positive for in, negative for out/adjustment');

            $table->decimal('cost_price', 10, 2)
                ->nullable()
                ->comment('Purchase price at time of stock in — for COGS calculation');

            // ── Reference ──
            $table->string('reference')->nullable()
                ->comment('Order ID, PO number, etc.');

            $table->string('source')->nullable()
                ->comment('sale, purchase, manual, return');

            $table->text('note')->nullable();


            $table->timestamps();
            $table->softDeletes();

            // ── Indexes ──
            $table->index(['product_id', 'type']);
            $table->index(['product_variant_id', 'type']);
            $table->index('reference');
            $table->index('created_at'); // date range queries ke liye
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};