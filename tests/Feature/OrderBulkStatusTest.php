<?php

use App\Http\Repositories\Admin\OrderRepository;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    \App\Models\CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    $country = \App\Models\Country::create(['name' => 'Pakistan', 'code' => 'PK']);
    $state   = \App\Models\State::create(['name' => 'Sindh', 'country_id' => $country->id]);
    $this->karachi = \App\Models\City::forceCreate(['name' => 'Karachi', 'state_id' => $state->id, 'province' => 'sindh', 'shipping_charges' => 200]);
    $this->hyderabad = \App\Models\City::forceCreate(['name' => 'Hyderabad', 'state_id' => $state->id, 'province' => 'sindh', 'shipping_charges' => 250]);
    $this->customer = Customer::create(['first_name' => 'Ali', 'phone' => '923001111111']);

    Permission::firstOrCreate(['name' => 'edit.orders', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web'])->givePermissionTo('edit.orders');
    $this->admin = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => bcrypt('secret')]);
    $this->admin->forceFill(['email_verified_at' => now()])->save();
    $this->admin->assignRole('admin');
});

function bulkOrder(string $status, $city): Order
{
    return Order::create([
        'customer_id' => test()->customer->id, 'city_id' => $city->id,
        'status' => $status, 'payment_status' => 'unpaid', 'grand_total' => 500,
    ]);
}

it('confirms the ticked orders and skips the ones the status rules do not allow', function () {
    $a = bulkOrder('pending', $this->karachi);
    $b = bulkOrder('pending', $this->karachi);
    $cancelled = bulkOrder('cancelled', $this->karachi);

    $this->actingAs($this->admin)
        ->postJson('/admin/orders/bulk-status', ['ids' => [$a->id, $b->id, $cancelled->id], 'status' => 'processing'])
        ->assertOk()
        ->assertJson(['updated' => 2, 'skipped' => ["{$cancelled->order_number} (cancelled)"]]);

    expect($a->fresh()->status)->toBe('processing')
        ->and($b->fresh()->status)->toBe('processing')
        ->and($cancelled->fresh()->status)->toBe('cancelled'); // never re-activated
});

it('marks orders returned (refunded) in bulk', function () {
    $delivered = bulkOrder('delivered', $this->karachi);

    $this->actingAs($this->admin)
        ->postJson('/admin/orders/bulk-status', ['ids' => [$delivered->id], 'status' => 'refunded'])
        ->assertOk()->assertJson(['updated' => 1]);

    expect($delivered->fresh()->status)->toBe('refunded');
});

it('needs the edit.orders permission', function () {
    $viewer = User::create(['name' => 'Viewer', 'email' => 'v@example.com', 'password' => bcrypt('secret')]);
    $viewer->forceFill(['email_verified_at' => now()])->save();
    Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
    $viewer->assignRole('manager');

    $order = bulkOrder('pending', $this->karachi);
    $this->actingAs($viewer)->postJson('/admin/orders/bulk-status', ['ids' => [$order->id], 'status' => 'processing'])
        ->assertForbidden();
    expect($order->fresh()->status)->toBe('pending');
});

it('filters the orders list by city and status', function () {
    $k1 = bulkOrder('pending', $this->karachi);
    bulkOrder('processing', $this->karachi);
    $h  = bulkOrder('pending', $this->hyderabad);

    $ids = fn (array $q) => app(OrderRepository::class)->getAllForDataTable(new Request($q))->pluck('id')->sort()->values()->all();

    expect($ids(['city_id' => $this->hyderabad->id]))->toBe([$h->id])
        ->and($ids(['city_id' => $this->karachi->id, 'status' => 'pending']))->toBe([$k1->id]);
});
