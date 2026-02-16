<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_requests', function (Blueprint $table) {

            $table->id();
            $table->foreignId('affiliate_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'processing', 'completed', 'rejected'])->default('pending');
            $table->string('transaction_id')->nullable();
            $table->string('payment_method_snapshot')->nullable();
            $table->text('payment_details_snapshot')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });

    }
    public function down(): void
    {
        Schema::dropIfExists('payout_requests');
    }
};
