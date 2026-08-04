<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ──────────────────────────────────────────────────────────────
        // PERMISSIONS — grouped by resource
        // ──────────────────────────────────────────────────────────────
        $permissions = [
            // Users
            'view.users', 'create.users', 'edit.users', 'delete.users',

            // Roles
            'view.roles', 'create.roles', 'edit.roles', 'delete.roles',

            // Permissions
            'view.permissions', 'create.permissions', 'edit.permissions', 'delete.permissions',

            // Products
            'view.products', 'create.products', 'edit.products', 'delete.products',

            // Categories
            'view.categories', 'create.categories', 'edit.categories', 'delete.categories',

            // Variants
            'view.variants', 'create.variants', 'edit.variants', 'delete.variants',

            // Attributes
            'view.attributes', 'create.attributes', 'edit.attributes', 'delete.attributes',

            // Deals
            'view.deals', 'create.deals', 'edit.deals', 'delete.deals',

            // Reviews (Product)
            'view.reviews', 'create.reviews', 'edit.reviews', 'delete.reviews',
            // Product reviews moderation (new action-based permissions)
            'reviews.view', 'reviews.moderate', 'reviews.delete',

            // Inventory
            'view.inventory', 'create.inventory', 'edit.inventory', 'delete.inventory',

            // Wishlists
            'view.wishlists', 'create.wishlists', 'edit.wishlists', 'delete.wishlists',

            // Slides
            'view.slides', 'create.slides', 'edit.slides', 'delete.slides',

            // Blog Categories
            'view.blog-categories', 'create.blog-categories', 'edit.blog-categories', 'delete.blog-categories',

            // Blog Tags
            'view.blogtags', 'create.blogtags', 'edit.blogtags', 'delete.blogtags',

            // Blogs
            'view.blogs', 'create.blogs', 'edit.blogs', 'delete.blogs',

            // Blog Comments
            'view.blogcomments', 'create.blogcomments', 'edit.blogcomments', 'delete.blogcomments',

            // Frontend Content
            'view.frontend', 'create.frontend', 'edit.frontend', 'delete.frontend',

            // Orders
            'view.orders', 'create.orders', 'edit.orders', 'delete.orders',

            // Order Reviews
            'view.order-reviews', 'create.order-reviews', 'edit.order-reviews', 'delete.order-reviews',

            // Coupons
            'view.coupons', 'create.coupons', 'edit.coupons', 'delete.coupons',

            // Cities
            'view.cities', 'create.cities', 'edit.cities', 'delete.cities',

            // Shipping
            'view.shippings', 'create.shippings', 'edit.shippings', 'delete.shippings',

            // Settings
            'view.settings', 'edit.settings', 'create.settings', 'delete.settings',

            // Reports / Analytics
            'view.reports', 'create.reports', 'edit.reports', 'delete.reports', 'export.reports',
            'view.analytics', 'create.analytics', 'edit.analytics', 'delete.analytics',

            // FAQs
            'view.faqs', 'create.faqs', 'edit.faqs', 'delete.faqs',

            // Newsletters
            'view.newsletters', 'create.newsletters', 'edit.newsletters', 'delete.newsletters',

            // Contacts
            'view.contacts', 'delete.contacts', 'create.contacts', 'edit.contacts',

            // Messages
            'view.messages', 'delete.messages', 'create.messages', 'edit.messages',

            // Wishlists (already added above)
            // Carts
            'view.carts', 'create.carts', 'edit.carts', 'delete.carts',

            // Payments
            'view.payments', 'create.payments', 'edit.payments', 'delete.payments',

            // Refunds
            'view.refunds', 'create.refunds', 'edit.refunds', 'delete.refunds',

            // Return Requests
            'view.return-requests', 'edit.return-requests', 'delete.return-requests',

            // Loyalty Points
            'view.loyalty', 'edit.loyalty', 'view.loyalty-settings', 'edit.loyalty-settings',

            // Affiliates
            'view.affiliates', 'create.affiliates', 'edit.affiliates', 'delete.affiliates',
            'view.payout.requests', 'approve.payout.requests',
            'view.affiliate.settings', 'update.affiliate.settings',
            'manage.affiliates', 'block.affiliates',

            // Notifications
            'view.notifications', 'create.notifications', 'edit.notifications', 'delete.notifications',

            // Customers
            'view.customers', 'create.customers', 'edit.customers', 'delete.customers',

            // Health Concerns
            'view.health-concerns', 'create.health-concerns', 'edit.health-concerns', 'delete.health-concerns',

            // Sales
            'view.sales', 'create.sales', 'edit.sales', 'delete.sales',

            // WhatsApp
            'view.whatsapp', 'send.whatsapp',

            // Maintenance / System
            'run-maintenance',
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // ──────────────────────────────────────────────────────────────
        // ROLES
        // ──────────────────────────────────────────────────────────────

        // 1. Super Admin — all permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdminRole->syncPermissions(Permission::all());

        // 2. Admin — all permissions (same as super-admin; super-admin is a safety guard above it)
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());

        // 3. Manager — can view and manage daily operations; cannot manage roles/permissions/settings
        $managerRole = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $managerRole->syncPermissions([
            // Products
            'view.products', 'create.products', 'edit.products',
            'view.categories', 'create.categories', 'edit.categories',
            'view.health-concerns', 'edit.health-concerns',
            'view.variants', 'create.variants', 'edit.variants',
            'view.attributes', 'create.attributes', 'edit.attributes',
            'view.deals', 'create.deals', 'edit.deals',
            'view.inventory', 'create.inventory', 'edit.inventory',
            'view.reviews', 'edit.reviews',
            'reviews.view', 'reviews.moderate', 'reviews.delete',
            'view.wishlists',

            // Shop
            'view.customers', 'create.customers', 'edit.customers',
            'view.orders', 'create.orders', 'edit.orders',
            'view.sales', 'create.sales', 'edit.sales',
            'view.coupons', 'create.coupons', 'edit.coupons',
            'view.cities',
            'view.order-reviews', 'edit.order-reviews',

            // Returns & Loyalty (view/edit — daily ops, no delete)
            'view.return-requests', 'edit.return-requests',
            'view.loyalty', 'edit.loyalty',

            // Content
            'view.blogs', 'create.blogs', 'edit.blogs',
            'view.blog-categories', 'create.blog-categories', 'edit.blog-categories',
            'view.blogtags', 'create.blogtags', 'edit.blogtags',
            'view.blogcomments', 'edit.blogcomments', 'delete.blogcomments',
            'view.slides', 'create.slides', 'edit.slides',
            'view.frontend', 'create.frontend', 'edit.frontend',

            // Messaging
            'view.contacts', 'edit.contacts',
            'view.newsletters',
            'view.whatsapp', 'send.whatsapp',
            'view.notifications',

            // Reports
            'view.reports', 'view.analytics', 'export.reports',

            // Affiliates (view only — admin can see affiliate management panel)
            'view.payout.requests',
        ]);

        // 4. Affiliate — limited to their own area
        $affiliateRole = Role::firstOrCreate(['name' => 'affiliate', 'guard_name' => 'web']);
        $affiliateRole->syncPermissions([
            'view.products',
            'view.reports',
            'view.analytics',
            'view.payout.requests',
            'view.affiliate.settings',
            'update.affiliate.settings',
            'view.affiliates',   // lets the sidebar show for affiliate users (their own data only)
            'view.blogs',
            'view.deals',
        ]);

        // 5. Customer — minimal read-only
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $customerRole->syncPermissions([
            'view.products',
            'view.orders',
            'create.reviews',
            'view.reviews',
            'view.wishlists',
            'create.wishlists',
            'create.messages',
            'view.messages',
        ]);

        // ──────────────────────────────────────────────────────────────
        // SEED USERS
        // ──────────────────────────────────────────────────────────────

        // Super Admin User
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name'     => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('password123'),
                'status'   => 1,
            ]
        );
        $superAdmin->syncRoles([$superAdminRole]);

        // Admin User
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Admin User',
                'username' => 'admin',
                'password' => Hash::make('password123'),
                'status'   => 1,
            ]
        );
        $adminUser->syncRoles([$adminRole]);

        // Manager User
        $managerUser = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name'     => 'Manager User',
                'username' => 'manager',
                'password' => Hash::make('password123'),
                'status'   => 1,
            ]
        );
        $managerUser->syncRoles([$managerRole]);

        $this->command->info('✅ Roles & Permissions seeded successfully!');
        $this->command->table(
            ['Role', 'Permissions Count'],
            [
                ['super-admin', $superAdminRole->permissions()->count()],
                ['admin', $adminRole->permissions()->count()],
                ['manager', $managerRole->permissions()->count()],
                ['affiliate', $affiliateRole->permissions()->count()],
                ['customer', $customerRole->permissions()->count()],
            ]
        );
    }
}