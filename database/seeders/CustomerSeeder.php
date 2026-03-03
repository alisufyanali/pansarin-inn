<?php 

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use App\Models\CustomerGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    public function run()
    {
        // 1. Default Customer Group
        $defaultGroup = CustomerGroup::firstOrCreate(
            ['name' => 'General'],
            ['discount_percentage' => 0, 'is_default' => true]
        );

        // 2. Tamam 5 Customers ka data
        $customersData = [
            [
                'first_name' => 'Nazar',
                'last_name' => 'Khan',
                'email' => 'nazar@gmail.com',
                'phone' => '03001234567',
                'address' => 'House #12, Street 5, Blue Area, Islamabad',
            ],
            [
                'first_name' => 'Zeeshan',
                'last_name' => 'Ahmed',
                'email' => 'zeeshan@example.com',
                'phone' => '03119876543',
                'address' => 'Flat 402, Al-Aziz Heights, Gulshan-e-Iqbal, Karachi',
            ],
            [
                'first_name' => 'Sara',
                'last_name' => 'Pervez',
                'email' => 'sara.p@gmail.com',
                'phone' => '03225554433',
                'address' => 'Villa 88, Phase 6, DHA, Lahore',
            ],
            [
                'first_name' => 'Usman',
                'last_name' => 'Ali',
                'email' => 'usman.ali@yahoo.com',
                'phone' => '03451122334',
                'address' => 'Shop #4, Main Market, Saddar, Rawalpindi',
            ],
            [
                'first_name' => 'Ayesha',
                'last_name' => 'Malik',
                'email' => 'ayesha.m@outlook.com',
                'phone' => '03337788990',
                'address' => 'Bungalow 15-B, Model Town, Faisalabad',
            ],
        ];

        foreach ($customersData as $data) {
            // User Create/Update
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['first_name'] . ' ' . $data['last_name'],
                    'username' => Str::slug($data['first_name'] . $data['last_name']) . rand(10, 99),
                    'phone' => $data['phone'],
                    'password' => Hash::make('password123'),
                    'status' => 1,
                ]
            );

            // Spatie Role Assign
            $user->assignRole('customer');

            // Customer Profile Create/Update
            $customer = Customer::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'customer_group_id' => $defaultGroup->id,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                    'status' => 'active',
                ]
            );

            // Wallet & Points (Har customer ke liye alag banega)
            if (!$customer->wallet) {
                $customer->wallet()->create(['balance' => 0]);
            }
            if (!$customer->loyaltyPoints) {
                $customer->loyaltyPoints()->create(['balance' => 0]);
            }
        }

        $this->command->info('Success: 5 Customers, Users, Wallets, and Points added!');
    }
}