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
    Schema::create('inventories', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
        $table->integer('quantity')->default(0);
        $table->enum('type', ['in','out'])->default('in');
        $table->string('reference')->nullable(); // e.g., purchase order or adjustment id
        $table->text('note')->nullable();
        $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamps();
        $table->index(['product_variant_id','type']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
