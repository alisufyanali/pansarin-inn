<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Every courier booking attempt (Leopards, PostEx, Movex) — successful or
 * not — with what the courier answered, so a failed booking is visible in
 * the admin and can be retried. API keys are never stored in `request`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
            $table->string('courier', 30);                  // leopard, px, movex
            $table->enum('status', ['booked', 'failed']);
            $table->string('tracking_number')->nullable();
            $table->string('destination_city')->nullable(); // the courier's own name for the city
            $table->text('message')->nullable();            // the courier's message or our reason
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->json('request')->nullable();            // what was sent (no credentials)
            $table->json('response')->nullable();           // the courier's full answer
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // who booked it
            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index('tracking_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_bookings');
    }
};
