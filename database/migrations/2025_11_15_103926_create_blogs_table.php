<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();

            // Basic Info
            $table->unsignedBigInteger('blog_category_id')->nullable();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();

            // Status & Publishing
            $table->enum('status', ['draft', 'published'])->default('draft');

            // Media
            $table->string('thumbnail')->nullable();

            // SEO Fields
            $table->string('meta_title', 60)->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->text('schema_markup')->nullable();

            // Social Fields
            $table->string('social_image')->nullable();
            $table->text('social_description')->nullable();

            $table->timestamps();

            $table->foreign('blog_category_id')
                ->references('id')
                ->on('blog_categories')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
