<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    public function run()
    {
        $customers = [
            [
                'name' => 'Nazar Khan',
                'email' => 'nazar@gmail.com',
                'phone' => '03001234567',
                'address' => 'House #12, Street 5, Blue Area, Islamabad',
            ],
            [
                'name' => 'Zeeshan Ahmed',
                'email' => 'zeeshan@example.com',
                'phone' => '03119876543',
                'address' => 'Flat 402, Al-Aziz Heights, Gulshan-e-Iqbal, Karachi',
            ],
            [
                'name' => 'Sara Pervez',
                'email' => 'sara.p@gmail.com',
                'phone' => '03225554433',
                'address' => 'Villa 88, Phase 6, DHA, Lahore',
            ],
            [
                'name' => 'Usman Ali',
                'email' => 'usman.ali@yahoo.com',
                'phone' => '03451122334',
                'address' => 'Shop #4, Main Market, Saddar, Rawalpindi',
            ],
            [
                'name' => 'Ayesha Malik',
                'email' => 'ayesha.m@outlook.com',
                'phone' => '03337788990',
                'address' => 'Bungalow 15-B, Model Town, Faisalabad',
            ],
        ];

        foreach ($customers as $customer) {
            Customer::updateOrCreate(
                ['email' => $customer['email']], // Email check karega taake duplicate na ho
                [
                    'name' => $customer['name'],
                    'password' => Hash::make('password123'), // Default password for all
                    'phone' => $customer['phone'],
                    'address' => $customer['address'],
                    'api_token' => Str::random(60),
                    'status' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $this->command->info('5  Customers added successfully!');
    }
}