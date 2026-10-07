<?php

// database/migrations/2026_01_09_000001_create_whatsapp_messages_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            // Meta's message id (wamid.…) — Meta retries webhooks, this keeps one row per message
            $table->string('wa_message_id')->nullable()->unique();
            $table->string('from_number');
            $table->string('contact_name')->nullable();
            $table->string('type', 30)->nullable();
            $table->text('message')->nullable();
            $table->string('media_url')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('received_at');
            $table->timestamps();

            $table->index('from_number');
            $table->index('is_read');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};
