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
            $table->string('from_number');
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
