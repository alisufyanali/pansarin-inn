<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions
        $permissions = [
            'view.users',
            'create.users',
            'edit.users',
            'delete.users',

            // Role permissions
            'view.roles',
            'create.roles',
            'edit.roles',
            'delete.roles',

            // Permission permissions
            'view.permissions',
            'create.permissions',
            'edit.permissions',
            'delete.permissions',

            // Product permissions
            'view.products',
            'create.products',
            'edit.products',
            'delete.products',

            // Category permissions
            'view.categories',
            'create.categories',
            'edit.categories',
            'delete.categories',

            // Variant permissions
            'view.variants',
            'create.variants',
            'edit.variants',
            'delete.variants',

            // Attribute permissions
            'view.attributes',
            'create.attributes',
            'edit.attributes',
            'delete.attributes',

            // BlogCategory permissions
            'view.blog-categories',
            'create.blog-categories',
            'edit.blog-categories',
            'delete.blog-categories',

            // Blog permissions
            'view.blogs',
            'create.blogs',
            'edit.blogs',
            'delete.blogs',

            // BlogComments permissions
            'view.blogcomments',
            'create.blogcomments',
            'edit.blogcomments',
            'delete.blogcomments',

            // BlogTag permissions
            'view.blogtags',
            'create.blogtags',
            'edit.blogtags',
            'delete.blogtags',

            // Frontend section permissions
            'view.frontend',
            'create.frontend',
            'edit.frontend',
            'delete.frontend',

            // Order permissions
            'view.orders',
            'create.orders',
            'edit.orders',
            'delete.orders',

            // Coupon permissions
            'view.coupons',
            'create.coupons',
            'edit.coupons',
            'delete.coupons',

            // Shipping permissions
            'view.shippings',
            'create.shippings',
            'edit.shippings',
            'delete.shippings',

            // Setting permissions
            'view.settings',
            'edit.settings',
            'create.settings',
            'delete.settings',

            // Report permissions
            'view.reports',
            'create.reports',
            'edit.reports',
            'delete.reports',

            // Review permissions
            'view.reviews',
            'delete.reviews',
            'edit.reviews',
            'create.reviews',

            // FAQ permissions
            'view.faqs',
            'create.faqs',
            'edit.faqs',
            'delete.faqs',

            // Subscriber permissions
            'view.subscribers',
            'delete.subscribers',
            'create.subscribers',
            'edit.subscribers',

            // Contact permissions
            'view.contacts',
            'delete.contacts',
            'create.contacts',
            'edit.contacts',

            // Message permissions
            'view.messages',
            'delete.messages',
            'create.messages',
            'edit.messages',

            // Order permissions
            'view.orders',
            'create.orders',
            'edit.orders',
            'delete.orders',

            // Wishlist permissions
            'view.wishlists',
            'create.wishlists',
            'edit.wishlists',
            'delete.wishlists',

            // Cart permissions
            'view.carts',
            'create.carts',
            'edit.carts',
            'delete.carts',

            // Payment permissions
            'view.payments',
            'create.payments',
            'edit.payments',
            'delete.payments',

            // Refund permissions
            'view.refunds',
            'create.refunds',
            'edit.refunds',
            'delete.refunds',

            // Affiliate permissions
            'view.affiliates',
            'create.affiliates',
            'edit.affiliates',
            'delete.affiliates',
            'view.payout.requests',
            'approve.payout.requests',
            'view.affiliate.settings',
            'update.affiliate.settings',
            'manage.affiliates',
            'block.affiliates',

            // Notification permissions
            'view.notifications',
            'create.notifications',
            'edit.notifications',
            'delete.notifications',

            // customer permissions
            'view.customers',
            'create.customers',
            'edit.customers',
            'delete.customers',

            // inventory permissions
            'view.inventory',
            'create.inventory',
            'edit.inventory',
            'delete.inventory',

            // analytics permissions
            'view.analytics',
            'create.analytics',
            'edit.analytics',
            'delete.analytics',

            // newsletter permissions
            'view.newsletters',
            'create.newsletters',
            'edit.newsletters',
            'delete.newsletters',

            // sales permissions
            'view.sales',
            'create.sales',
            'edit.sales',
            'delete.sales',

            // deals permissions
            'view.deals',
            'create.deals',
            'edit.deals',
            'delete.deals',

            // whatsapp permissions
            'view.whatsapp',
            'send.whatsapp',

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Define roles and assign existing permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());

        // 3. Setup Affiliate Role (Limited)
        $affiliateRole = Role::firstOrCreate(['name' => 'affiliate']);
        $affiliateRole->syncPermissions([
            'view.products',
            'view.reports',
            'view.analytics',
            'view.payout.requests',     // To see their own
            'view.affiliate.settings',
            'update.affiliate.settings',
            'view.blogs',
            'view.deals'
        ]);

        // 4. Setup Customer Role (Minimal)
        $customerRole = Role::firstOrCreate(['name' => 'customer']);
        $customerRole->syncPermissions([
            'view.products',
            'view.orders',
            'create.reviews',
            'view.reviews',
            'view.wishlists',
            'create.wishlists',
            'create.messages',
            'view.messages'
        ]);

        // 5. Create the Super Admin User
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'password' => Hash::make('password123'),
                'status' => 1
            ]
        );
        $adminUser->assignRole($adminRole);
    }
}
