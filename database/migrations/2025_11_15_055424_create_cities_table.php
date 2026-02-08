<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('shipping_charges', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes(); // soft delete
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
