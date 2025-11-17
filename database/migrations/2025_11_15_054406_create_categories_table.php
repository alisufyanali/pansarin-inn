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
    Schema::create('categories', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('image')->nullable();
        $table->unsignedBigInteger('parent_id')->nullable();
        $table->boolean('status')->default(true);
        $table->timestamps();

        $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
        $table->index('slug');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
