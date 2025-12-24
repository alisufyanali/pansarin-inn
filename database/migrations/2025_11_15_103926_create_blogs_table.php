<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blogs', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('blog_category_id')->nullable();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('content')->nullable();
    $table->string('thumbnail')->nullable();
    $table->timestamps();

    $table->foreign('blog_category_id')->references('id')->on('blog_categories')->nullOnDelete();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
