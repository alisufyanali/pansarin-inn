<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * return_requests  — one record per return request
 * return_request_items — one record per item being returned
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->onDelete('cascade');

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])
                  ->default('pending');

            $table->enum('reason_category', ['defective', 'wrong_item', 'not_needed', 'other']);

            $table->text('comment')->nullable();

            // Admin fields
            $table->text('admin_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            $table->index('order_id');
            $table->index('user_id');
            $table->index('status');
        });

        Schema::create('return_request_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('return_request_id')
                  ->constrained('return_requests')
                  ->onDelete('cascade');

            $table->foreignId('order_item_id')
                  ->constrained('order_items')
                  ->onDelete('cascade');

            $table->unsignedInteger('quantity');

            $table->string('item_reason')->nullable()
                  ->comment('Per-item reason, e.g. broken, incorrect size');

            $table->timestamps();

            $table->index('return_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('return_request_items');
        Schema::dropIfExists('return_requests');
    }
};
