<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('affiliate_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->references('id')->on('users')->nullOnDelete();

            $table->decimal('order_amount', 10, 2);
            $table->decimal('commission_rate_snapshot', 5, 2);
            $table->decimal('commission_amount', 10, 2);

            $table->enum('status', ['pending', 'approved', 'cancelled', 'paid'])->default('pending');

            $table->tinyInteger('level')->default(1);
            $table->string('source_type')->default('direct');

            $table->unique('order_id');
            $table->index(['affiliate_id', 'status']);

            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
