<?php

namespace Database\Seeders;

use App\Models\GeneralSetting;
use Illuminate\Database\Seeder;

class GeneralSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // --- System Basics ---
            ['type' => 'system_name', 'value' => 'Pansari Inn'],
            ['type' => 'system_title', 'value' => 'Pansari Inn | Admin Dashboard'],
            ['type' => 'application_name', 'value' => 'Pansari-Inn-Web'],

            // --- Contact & Footer ---
            ['type' => 'contact_email', 'value' => 'info@pansariinn.com'],
            ['type' => 'contact_phone', 'value' => '+92 304 5779900'],
            ['type' => 'contact_address', 'value' => 'Shop #12, Pansari Market, Karachi, Pakistan'],
            ['type' => 'facebook_url', 'value' => 'https://facebook.com/pansariinn'],
            ['type' => 'instagram_url', 'value' => 'https://instagram.com/pansariinn'],
            ['type' => 'footer_text', 'value' => '© 2026 Pansari Inn. All Rights Reserved.'],

            // --- SEO & Meta ---
            ['type' => 'meta_title', 'value' => 'Pansari Inn - Pure Organic Herbs & Spices'],
            ['type' => 'meta_description', 'value' => 'Shop the best quality organic herbs, oils, and natural products online.'],
            ['type' => 'meta_keywords', 'value' => 'organic, herbs, pansari, natural oils, health'],
            ['type' => 'google_analytics_id', 'value' => 'G-XXXXXXXXXX'],

            // --- Ecommerce Core ---
            ['type' => 'vendor_system', 'value' => 'no'],
            ['type' => 'wallet_system', 'value' => 'yes'],
            ['type' => 'guest_checkout', 'value' => 'yes'],
            ['type' => 'digital_product', 'value' => 'no'],

            // --- Auth & Social Login ---
            ['type' => 'google_login', 'value' => 'no'],
            ['type' => 'google_client_id', 'value' => ''],
            ['type' => 'facebook_login', 'value' => 'no'],
            ['type' => 'facebook_app_id', 'value' => ''],

            // --- Email / SMTP ---
            ['type' => 'mail_driver', 'value' => 'smtp'],
            ['type' => 'mail_host', 'value' => 'smtp.mailtrap.io'],
            ['type' => 'mail_port', 'value' => '587'],
            ['type' => 'mail_username', 'value' => ''],
            ['type' => 'mail_password', 'value' => ''],
            ['type' => 'mail_encryption', 'value' => 'tls'],

            // --- Security ---
            ['type' => 'captcha_status', 'value' => 'no'],
            ['type' => 'captcha_key', 'value' => ''],
            ['type' => 'captcha_secret', 'value' => ''],

            // --- Advanced ---
            ['type' => 'cache_time', 'value' => '60'],
            ['type' => 'debug_mode', 'value' => 'no'],
        ];

        foreach ($settings as $setting) {
            GeneralSetting::updateOrCreate(
                ['type' => $setting['type']],
                ['value' => $setting['value']]
            );
        }
    }
}
