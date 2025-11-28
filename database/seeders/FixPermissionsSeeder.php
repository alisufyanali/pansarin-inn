<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class FixPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions
        $permissions = [
            "view.users",
            "create.users",
            "edit.users",
            "delete.users",
            "view.roles",
            "create.roles",
            "edit.roles",
            "delete.roles",
            "view.products",
            "create.products",
            "edit.products",
            "delete.products",
            "view.categories",
            "create.categories",
            "edit.categories",
            "delete.categories",
            "view.variants",
            "create.variants",
            "edit.variants",
            "delete.variants",
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Get or create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Sync all permissions to admin role
        $adminRole->syncPermissions(Permission::all());

        // Get admin user
        $adminUser = User::where('email', 'admin@example.com')->first();

        if ($adminUser) {
            // If admin exists, assign admin role
            if (!$adminUser->hasRole('admin')) {
                $adminUser->assignRole('admin');
            }
            $this->command->info('✅ Admin user already exists. All permissions assigned!');
        } else {
            // If admin doesn't exist, create it
            $adminUser = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]);

            $adminUser->assignRole('admin');
            $this->command->info('✅ Admin user created successfully with all permissions!');
        }

        $this->command->info('✅ All permissions created and assigned to admin role!');
    }
}
