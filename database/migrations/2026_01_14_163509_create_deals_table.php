<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // "Summer Sale", "Flash Deal"
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable(); // Deal banner

            // Deal Type
            $table->enum('deal_type', [
                'percentage', // 20% off
                'fixed', // Rs. 500 off
                'buy_x_get_y', // Buy 2 Get 1 Free
                'bundle', // Bundle deal
                'flash_sale', // Limited time
            ])->default('percentage');

            // Discount Values
            $table->decimal('discount_value', 10, 2)->nullable(); // 20 or 500
            $table->integer('min_quantity')->default(1); // Buy X
            $table->integer('free_quantity')->default(0); // Get Y free

            // Conditions
            $table->decimal('min_purchase_amount', 10, 2)->nullable();
            $table->integer('max_uses')->nullable(); // Total uses limit
            $table->integer('max_uses_per_user')->nullable();
            $table->integer('current_uses')->default(0);

            // Timing
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();

            // Display
            $table->string('badge_text')->nullable(); // "50% OFF", "HOT DEAL"
            $table->string('badge_color')->default('#ff0000');
            $table->integer('display_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('deals');
    }
};
