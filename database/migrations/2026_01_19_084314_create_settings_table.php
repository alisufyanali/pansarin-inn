<?php

// database/migrations/2026_01_09_000003_add_whatsapp_settings.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add to your existing settings table or create new
        DB::table('settings')->insert([
            ['key' => 'whatsapp_phone_number_id', 'value' => '584529538085245'],
            ['key' => 'whatsapp_access_token', 'value' => 'your_token_here'],
            ['key' => 'whatsapp_verify_token', 'value' => 'pansariinn123'],
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'whatsapp_phone_number_id',
            'whatsapp_access_token',
            'whatsapp_verify_token',
        ])->delete();
    }
};
