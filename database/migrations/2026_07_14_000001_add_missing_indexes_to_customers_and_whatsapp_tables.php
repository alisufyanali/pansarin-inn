<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Missing indexes for high-frequency query columns:
 *   - customers.email          (order tracking, auth lookups)
 *   - customers.phone          (guest order, WhatsApp matching)
 *   - whatsapp_message_logs.phone   (forPhone() scope — every chat open)
 *   - whatsapp_messages.from_number (fromNumber() scope — every chat open)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (! $this->hasIndex('customers', 'customers_email_index')) {
                $table->index('email', 'customers_email_index');
            }
            if (! $this->hasIndex('customers', 'customers_phone_index')) {
                $table->index('phone', 'customers_phone_index');
            }
        });

        Schema::table('whatsapp_message_logs', function (Blueprint $table) {
            if (! $this->hasIndex('whatsapp_message_logs', 'whatsapp_message_logs_phone_index')) {
                $table->index('phone', 'whatsapp_message_logs_phone_index');
            }
        });

        Schema::table('whatsapp_messages', function (Blueprint $table) {
            if (! $this->hasIndex('whatsapp_messages', 'whatsapp_messages_from_number_index')) {
                $table->index('from_number', 'whatsapp_messages_from_number_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndexIfExists('customers_email_index');
            $table->dropIndexIfExists('customers_phone_index');
        });

        Schema::table('whatsapp_message_logs', function (Blueprint $table) {
            $table->dropIndexIfExists('whatsapp_message_logs_phone_index');
        });

        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->dropIndexIfExists('whatsapp_messages_from_number_index');
        });
    }

    private function hasIndex(string $table, string $index): bool
    {
        try {
            $sm      = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes($table);
            return isset($indexes[$index]);
        } catch (\Throwable) {
            return false;
        }
    }
};
