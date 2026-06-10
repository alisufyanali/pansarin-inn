<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Affiliate;
use App\Models\Customer;
use App\Models\CustomerGroup;
use App\Models\Referral;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Default Customer Group
        $defaultGroup = CustomerGroup::firstOrCreate(
            ['name' => 'General'],
            ['discount_percentage' => 0, 'is_default' => true]
        );

        // 1. Base Users
        $usersData = [
            ['name' => 'Super Admin', 'username' => 'admin', 'email' => 'admin@example.com', 'role' => 'admin'],
            ['name' => 'John Customer', 'username' => 'customer_john', 'email' => 'customer1@example.com', 'role' => 'customer'],
            ['name' => 'Sarah Buyer', 'username' => 'customer_sarah', 'email' => 'customer2@example.com', 'role' => 'customer'],
            ['name' => 'Partner Marketer', 'username' => 'affiliate_pro', 'email' => 'affiliate1@example.com', 'role' => 'affiliate'],
            ['name' => 'Influencer One', 'username' => 'affiliate_star', 'email' => 'affiliate2@example.com', 'role' => 'affiliate'],
        ];

        foreach ($usersData as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'username' => $data['username'],
                    'password' => Hash::make('password123'),
                    'status'   => 1,
                ]
            );

            $user->syncRoles([$data['role']]);

            if ($data['role'] === 'customer' || $data['role'] === 'affiliate') {
                $this->createCustomerProfile($user, $defaultGroup->id);
            }

            if ($data['role'] === 'affiliate') {
                Affiliate::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'affiliate_code'  => $data['email'] === 'affiliate1@example.com' ? 'PARTNER786' : strtoupper(Str::random(10)),
                        'status'          => 'active',
                        'commission_rate' => 5.00,
                        'joined_at'       => now(),
                    ]
                );
            }
        }

        // 2. Referrals Logic (Connecting to referrals table)
        $referrerUser = User::where('email', 'affiliate1@example.com')->first();
        $affiliate = Affiliate::where('user_id', $referrerUser->id)->first();

        if ($referrerUser && $affiliate) {
            $referralUsers = [
                ['name' => 'Referral One', 'username' => 'ref_user_1', 'email' => 'referral1@example.com'],
                ['name' => 'Referral Two', 'username' => 'ref_user_2', 'email' => 'referral2@example.com'],
            ];

            foreach ($referralUsers as $ref) {
                $newUser = User::updateOrCreate(
                    ['email' => $ref['email']],
                    [
                        'name'        => $ref['name'],
                        'username'    => $ref['username'],
                        'password'    => Hash::make('password123'),
                        'status'      => 1,
                        'referred_by' => $referrerUser->id,
                    ]
                );

                $newUser->syncRoles(['customer']);
                $customerProfile = $this->createCustomerProfile($newUser, $defaultGroup->id);

                // REFERRALS TABLE MEIN ENTRY
                Referral::updateOrCreate(
                    ['customer_id' => $customerProfile->id], // Customer Profile link
                    [
                        'affiliate_id'             => $affiliate->id,
                        'level'                    => 1,
                        'status'                   => 'pending', // Abhi order nahi hua isliye pending
                        'referral_type'            => 'direct',
                        'commission_rate_snapshot' => $affiliate->commission_rate,
                        'order_amount'             => 0,
                        'commission_amount'        => 0,
                    ]
                );
            }
        }

        $this->command->info('Success: Admin, Affiliates, Customers & Referrals seeded correctly!');
    }

    private function createCustomerProfile($user, $groupId)
    {
        $customer = Customer::updateOrCreate(
            ['user_id' => $user->id],
            [
                'customer_group_id' => $groupId,
                'first_name'        => explode(' ', $user->name)[0],
                'last_name'         => explode(' ', $user->name)[1] ?? '',
                'email'             => $user->email,
                'phone'             => $user->phone ?? '0300' . rand(1111111, 9999999),
                'status'            => 'active',
            ]
        );

        if (!$customer->wallet) { $customer->wallet()->create(['balance' => 0]); }
        if (!$customer->loyaltyPoints) { $customer->loyaltyPoints()->create(['balance' => 0]); }

        return $customer;
    }
}