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
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Nullable for guests

            $table->string('customer_name'); // name (for guests)
            $table->string('customer_email')->nullable();
            $table->string('order_number')->nullable(); // to verify the purchase
            $table->string('title')->nullable();

            $table->integer('rating')->default(5);
            $table->text('comment');
            $table->json('images')->nullable();
            $table->unsignedInteger('helpful_count')->default(0);
            $table->text('admin_reply')->nullable();
            $table->timestamp('admin_replied_at')->nullable();
            $table->boolean('is_verified')->default(false); // set by the backend
            $table->boolean('status')->default(false); // approved by an admin
            $table->boolean('show_on_homepage')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();

            // WHERE product_id = ? AND status = 1
            $table->index(['product_id', 'status'], 'product_reviews_product_status_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
