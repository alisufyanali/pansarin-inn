<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sequences', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->unsignedBigInteger('value')->default(50000);
        });

        // Seed the order_number sequence
        DB::table('sequences')->insert([
            'key'   => 'order_number',
            'value' => 50000,
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('sequences');
    }
};
