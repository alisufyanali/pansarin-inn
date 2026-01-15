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
        
        $table->string('customer_name'); // Guest ke liye name
        $table->string('customer_email')->nullable();
        $table->string('order_number')->nullable(); // Order verify karne ke liye
        
        $table->integer('rating')->default(5);
        $table->text('comment');
        $table->boolean('is_verified')->default(false); // Backend check karega
        $table->boolean('status')->default(false); // Admin approve karega ya nahi
        $table->timestamps();
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
