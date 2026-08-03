<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_health_concern', function (Blueprint $table) {
            $table->foreignId('product_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->foreignId('health_concern_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->primary(['product_id', 'health_concern_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_health_concern');
    }
};
