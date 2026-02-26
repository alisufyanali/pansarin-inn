<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->foreignId('attribute_value_id')
                ->constrained('attribute_values')
                ->cascadeOnDelete();
            $table->decimal('price_adjustment', 10, 2)->default(0);
            $table->timestamps();

            // Unique constraint
            $table->unique(['product_id', 'attribute_value_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_attribute_values');
    }
};
