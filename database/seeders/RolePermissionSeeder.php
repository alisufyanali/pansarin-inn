<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions
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
            "view.attributes",
            "create.attributes",
            "edit.attributes",
            "delete.attributes",
            // BlogCategory permissions - CHANGED TO MATCH CONTROLLER
            "view.blog-categories",
            "create.blog-categories",
            "edit.blog-categories",
            "delete.blog-categories",
            // Blog permissions
            "view.blogs",
            "create.blogs",
            "edit.blogs",
            "delete.blogs",
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Define roles and assign existing permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());

        // Create admin user if not exists
        $adminEmail = 'admin@example.com';
        $adminUser = User::where('email', $adminEmail)->first();

        if (!$adminUser) {
            $adminUser = User::create([
                'name' => 'Admin User',
                'email' => $adminEmail,
                'password' => Hash::make('password123'),
            ]);
        }

        // Assign admin role to admin user
        if (!$adminUser->hasRole('admin')) {
            $adminUser->assignRole('admin');
        }
    }
}