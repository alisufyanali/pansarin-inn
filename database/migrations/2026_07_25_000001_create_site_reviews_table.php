<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_reviews', function (Blueprint $table) {
            $table->id();

            // Order verification — required, one review per order
            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->onDelete('cascade');
            $table->string('order_number')->index(); // denormalised for fast lookups & display

            // Reviewer details (public submission, no auth required)
            $table->string('reviewer_name');
            $table->string('reviewer_email');

            // Review content
            $table->unsignedTinyInteger('rating')->comment('1-5 stars');
            $table->text('comment');
            $table->string('image')->nullable()->comment('Optional uploaded image path');

            // Moderation
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_note')->nullable();

            $table->timestamps();

            // Prevent duplicate reviews for the same order
            $table->unique('order_id', 'site_reviews_order_id_unique');
            $table->index('status');
            $table->index('reviewer_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_reviews');
    }
};
