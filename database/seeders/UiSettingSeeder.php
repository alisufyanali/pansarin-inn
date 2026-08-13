<?php

namespace Database\Seeders;

use App\Models\UiSetting;
use Illuminate\Database\Seeder;

class UiSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Branding
            'header_color' => '#3ab805',
            'footer_color' => '#05b8a3',
            'font' => 'Roboto',

            // Menu Toggles
            'header_homepage_status' => 'yes',
            'header_blogs_status' => 'no',
            'header_contact_status' => 'yes',

            // Homepage
            'featured_show' => 'ok',
            'marquee_text' => 'Welcome to Pansari Inn - Quality at your doorstep!',
            'no_of_featured_products' => '6',

            // JSON Structures (Default Empty Arrays)
            'home_categories' => '[]',
            'top_slide_categories' => '[]',

            // Marketing
            'whatsapp_number' => '+92 304 5779900',
            'affiliate_system' => 'no',
        ];

        foreach ($settings as $type => $value) {
            UiSetting::updateOrCreate(['type' => $type], ['value' => $value]);
        }
    }
}
