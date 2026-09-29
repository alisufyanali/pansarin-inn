<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('guests are redirected to the login page', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('staff users can visit the dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(Role::create(['name' => 'manager', 'guard_name' => 'web']));

    $this->actingAs($user)->get(route('admin.dashboard'))->assertOk();
});

test('customers cannot enter the admin panel even with view permissions', function () {
    $role = Role::create(['name' => 'customer', 'guard_name' => 'web']);
    $role->givePermissionTo(Permission::create(['name' => 'view.orders', 'guard_name' => 'web']));
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user)->get(route('admin.dashboard'))->assertForbidden();
    $this->actingAs($user)->get(route('admin.orders.index'))->assertForbidden();
});

test('affiliates are sent to their own dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(Role::create(['name' => 'affiliate', 'guard_name' => 'web']));

    $this->actingAs($user)->get(route('admin.dashboard'))->assertRedirect(route('affiliate.dashboard'));
});

test('staff without edit.orders cannot change an order status', function () {
    $user = User::factory()->create();
    $user->assignRole(Role::create(['name' => 'packer', 'guard_name' => 'web']));

    $this->actingAs($user)->post(route('admin.orders.updateStatus', 1), ['status' => 'delivered'])->assertForbidden();
    $this->actingAs($user)->post(route('admin.orders.updatePayment', 1), ['payment_status' => 'paid'])->assertForbidden();
    $this->actingAs($user)->get(route('admin.product-variants.index'))->assertForbidden();
    $this->actingAs($user)->getJson(route('admin.customers.search', ['q' => 'a']))->assertForbidden();
});
