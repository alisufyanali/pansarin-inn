<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            // Meta's message id (wamid.…) — Meta retries webhooks, this keeps one row per message
            if (! Schema::hasColumn('whatsapp_messages', 'wa_message_id')) {
                $table->string('wa_message_id')->nullable()->unique()->after('id');
            }
            if (! Schema::hasColumn('whatsapp_messages', 'contact_name')) {
                $table->string('contact_name')->nullable()->after('from_number');
            }
            if (! Schema::hasColumn('whatsapp_messages', 'type')) {
                $table->string('type', 30)->nullable()->after('contact_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            foreach (['wa_message_id', 'contact_name', 'type'] as $column) {
                if (Schema::hasColumn('whatsapp_messages', $column)) {
                    if ($column === 'wa_message_id') {
                        $table->dropUnique(['wa_message_id']);
                    }
                    $table->dropColumn($column);
                }
            }
        });
    }
};
