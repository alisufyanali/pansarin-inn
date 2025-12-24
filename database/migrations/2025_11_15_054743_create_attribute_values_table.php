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
    Schema::create('attribute_values', function (Blueprint $table) {
        $table->id();
        $table->foreignId('attribute_id')->constrained('attributes')->onDelete('cascade');
        $table->string('value');
        $table->string('slug')->nullable();
        $table->timestamps();
        $table->index(['attribute_id','value']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
    }
};
