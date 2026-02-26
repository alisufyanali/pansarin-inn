<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // 1 Roles
        $roles = ['admin', 'customer', 'affiliate'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // 2 Permissions
        $permissions = [
            'manage users',
            'manage roles',
            'manage permissions',
        ];
        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p]);
        }

        // Assign permissions to admin role
        $adminRole = Role::where('name', 'admin')->first();
        $adminRole->syncPermissions($permissions);

        // 3 Users
        $usersData = [
            ['name' => 'Super Admin', 'username' => 'admin', 'email' => 'admin@example.com', 'role' => 'admin'],
            ['name' => 'John Doe', 'username' => 'customer1', 'email' => 'customer1@example.com', 'role' => 'customer'],
            ['name' => 'Jane Smith', 'username' => 'customer2', 'email' => 'customer2@example.com', 'role' => 'customer'],
            ['name' => 'Affiliate One', 'username' => 'affiliate1', 'email' => 'affiliate1@example.com', 'role' => 'affiliate'],
            ['name' => 'Affiliate Two', 'username' => 'affiliate2', 'email' => 'affiliate2@example.com', 'role' => 'affiliate'],
        ];

        foreach ($usersData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'username' => $data['username'],
                    'password' => bcrypt('Password123'),
                    'status' => 1,
                ]
            );

            $user->syncRoles([$data['role']]);
        }

        $this->command->info('Roles and users seeded successfully!');
    }
}
