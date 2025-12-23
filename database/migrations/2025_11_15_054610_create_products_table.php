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
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vendor_id')
                ->nullable()
                ->constrained('vendors')
                ->nullOnDelete();

            $table->foreignId('category_id')
                ->constrained('categories')
                ->cascadeOnDelete();

            // $table->foreignId('sub_category_id')
            //     ->nullable()
            //     ->constrained('sub_categories')
            //     ->nullOnDelete();

            $table->string('name');
            $table->string('urdu_name')->nullable();
            $table->string('scientific_name')->nullable();
            $table->string('alternative_name')->nullable();
            $table->string('other_name')->nullable();
            $table->string('unit')->nullable();

            $table->string('slug')->unique();

            $table->string('sku')->nullable()->index();
            $table->string('barcode')->nullable();

            $table->string('thumbnail')->nullable();
            $table->json('gallery')->nullable();
            $table->string('social_image')->nullable();

            $table->text('short_description')->nullable();
            $table->longText('long_description')->nullable();

            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('sale_price', 12, 2)->nullable();

            $table->integer('stock_qty')->default(0);
            $table->integer('stock_alert')->default(5);
            $table->json('tags')->nullable();

            $table->boolean('featured')->default(false);
            $table->boolean('status')->default(true);

            $table->integer('sort_order')->default(0);

            // SEO Fields
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->text('schema_markup')->nullable();
            $table->text('social_description')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });   
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
