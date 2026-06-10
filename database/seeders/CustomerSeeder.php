<?php 

namespace Database\Seeders;

use App\Models\City;
use App\Models\Customer;
use App\Models\CustomerGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    public function run()
    {
        // City IDs by name
        $cityMap = City::pluck('id', 'name')->toArray();

        $customers = [
            [
                'first_name' => 'Nazar',
                'last_name'  => 'Khan',
                'email'      => 'nazar@gmail.com',
                'phone'      => '03001234567',
                'address'    => 'House #12, Street 5, Blue Area',
                'address2'   => 'Near Jinnah Super Market',
                'city_id'    => $cityMap['Islamabad'] ?? null,
                'country'    => 'Pakistan',
            ],
            [
                'first_name' => 'Zeeshan',
                'last_name'  => 'Ahmed',
                'email'      => 'zeeshan@example.com',
                'phone'      => '03119876543',
                'address'    => 'Flat 402, Al-Aziz Heights, Gulshan-e-Iqbal',
                'address2'   => 'Block 14, Near Nipa Chowrangi',
                'city_id'    => $cityMap['Karachi'] ?? null,
                'country'    => 'Pakistan',
            ],
            [
                'first_name' => 'Sara',
                'last_name'  => 'Pervez',
                'email'      => 'sara.p@gmail.com',
                'phone'      => '03225554433',
                'address'    => 'Villa 88, Phase 6, DHA',
                'address2'   => null,
                'city_id'    => $cityMap['Lahore'] ?? null,
                'country'    => 'Pakistan',
            ],
            [
                'first_name' => 'Usman',
                'last_name'  => 'Ali',
                'email'      => 'usman.ali@yahoo.com',
                'phone'      => '03451122334',
                'address'    => 'Shop #4, Main Market, Saddar',
                'address2'   => 'Near Rawalpindi General Hospital',
                'city_id'    => $cityMap['Rawalpindi'] ?? null,
                'country'    => 'Pakistan',
            ],
            [
                'first_name' => 'Ayesha',
                'last_name'  => 'Malik',
                'email'      => 'ayesha.m@outlook.com',
                'phone'      => '03337788990',
                'address'    => 'Bungalow 15-B, Model Town',
                'address2'   => null,
                'city_id'    => $cityMap['Faisalabad'] ?? null,
                'country'    => 'Pakistan',
            ],
        ];

        foreach ($customers as $customer) {
            Customer::updateOrCreate(
                ['email' => $customer['email']],
                array_merge($customer, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $this->command->info('Success: 5 Customers, Users, Wallets, and Points added!');
    }
}