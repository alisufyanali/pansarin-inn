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

            $table->foreignId('product_id')
                ->constrained('products')
                ->onDelete('cascade');

            // Optional: For products with variants
            $table->foreignId('product_variant_id')
                ->nullable()
                ->constrained('product_variants')
                ->onDelete('cascade');

            // Stock quantity
            $table->integer('quantity')->default(0);

            // ✅ Unit column
            $table->string('unit', 50)->nullable();

            // Transaction type
            $table->enum('type', ['in', 'out'])->default('in');

            // Reference number
            $table->string('reference')->nullable();

            // Additional notes
            $table->text('note')->nullable();

            // Track who performed this action
            $table->foreignId('performed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['product_id', 'type']);
            $table->index('created_at');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
