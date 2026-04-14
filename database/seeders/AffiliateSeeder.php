<?php

namespace Database\Seeders;

use App\Models\Affiliate;
use App\Models\AffiliateSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AffiliateSeeder extends Seeder
{
    public function run(): void
    {
        // Affiliate settings (key-value format)
        $settings = [
            ['key' => 'commission_rate',      'value' => '5.00'],
            ['key' => 'min_payout',           'value' => '500'],
            ['key' => 'cookie_days',          'value' => '30'],
            ['key' => 'is_active',            'value' => '1'],
            ['key' => 'terms_and_conditions', 'value' => 'Standard affiliate terms apply.'],
        ];

        foreach ($settings as $setting) {
            AffiliateSetting::firstOrCreate(['key' => $setting['key']], $setting);
        }

        // Create affiliates for existing users
        $users = User::take(3)->get();
        foreach ($users as $user) {
            Affiliate::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'affiliate_code' => strtoupper(Str::random(8)),
                    'commission_rate' => 5.00,
                    'status'         => 'active',
                ]
            );
        }

        $this->command->info('Affiliates seeded successfully!');
    }
}
