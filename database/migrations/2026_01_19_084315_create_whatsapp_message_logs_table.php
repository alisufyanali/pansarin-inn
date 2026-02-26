<?php

// database/migrations/2026_01_09_000002_create_whatsapp_message_logs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_message_logs', function (Blueprint $table) {
            $table->id();
            $table->string('phone');
            $table->string('customer_name')->nullable();
            $table->string('order_id')->nullable();
            $table->decimal('order_total', 10, 2)->default(0);
            $table->text('delivery_address')->nullable();
            $table->text('messages');
            $table->text('api_response')->nullable();
            $table->timestamps();

            $table->index('phone');
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_message_logs');
    }
};
