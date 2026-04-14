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
        // Affiliate settings
        AffiliateSetting::firstOrCreate(
            ['id' => 1],
            [
                'commission_rate'     => 5.00,
                'min_payout'          => 500,
                'cookie_days'         => 30,
                'is_active'           => true,
                'terms_and_conditions'=> 'Standard affiliate terms apply.',
            ]
        );

        // Create affiliates for existing users
        $users = User::take(3)->get();
        foreach ($users as $user) {
            Affiliate::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'affiliate_code'         => strtoupper(Str::random(8)),
                    'commission_rate'        => 5.00,
                    'balance'                => rand(0, 2000),
                    'payment_method'         => 'bank',
                    'payment_account_title'  => $user->name,
                    'payment_iban_details'   => 'PK00XXXX0000000000000000',
                    'status'                 => 'active',
                    'total_earnings'         => rand(0, 5000),
                    'total_clicks'           => rand(10, 500),
                    'total_conversions'      => rand(1, 50),
                ]
            );
        }

        $this->command->info('Affiliates seeded successfully!');
    }
}
