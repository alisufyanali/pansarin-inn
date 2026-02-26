<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Define the 5 specific users
        $usersData = [
            // The Admin
            [
                'name'     => 'Super Admin', 
                'username' => 'admin', 
                'email'    => 'admin@example.com', 
                'role'     => 'admin'
            ],
            // The 2 Customers
            [
                'name'     => 'John Customer', 
                'username' => 'customer_john', 
                'email'    => 'customer1@example.com', 
                'role'     => 'customer'
            ],
            [
                'name'     => 'Sarah Buyer', 
                'username' => 'customer_sarah', 
                'email'    => 'customer2@example.com', 
                'role'     => 'customer'
            ],
            // The 2 Affiliates
            [
                'name'     => 'Partner Marketer', 
                'username' => 'affiliate_pro', 
                'email'    => 'affiliate1@example.com', 
                'role'     => 'affiliate'
            ],
            [
                'name'     => 'Influencer One', 
                'username' => 'affiliate_star', 
                'email'    => 'affiliate2@example.com', 
                'role'     => 'affiliate'
            ],
        ];

        foreach ($usersData as $data) {
            // Create or update the user
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'username' => $data['username'],
                    'password' => Hash::make('Password123'), // Secure way to set password
                    'status'   => 1, // Assuming 1 means active
                ]
            );

            // Sync the role (clears old roles and adds the new one)
            // Note: This matches the roles created in RolePermissionSeeder
            $user->syncRoles([$data['role']]);
        }

        $this->command->info('Successfully seeded 1 Admin, 2 Customers, and 2 Affiliates.');
    }
}