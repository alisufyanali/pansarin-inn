<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('frontend_contents', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // carousel or banner
            $table->string('image');
            $table->string('title')->nullable();
            $table->integer('order')->nullable()->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('link')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frontend_contents');
    }
};
