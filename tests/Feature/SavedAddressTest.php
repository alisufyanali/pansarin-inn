<?php

use App\Models\City;
use App\Models\CustomerGroup;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    $category = \App\Models\Category::create(['name' => 'Test', 'slug' => 'test', 'status' => true]);
    $product  = \App\Models\Product::create(['category_id' => $category->id, 'name' => 'Herb', 'slug' => 'herb-x', 'sku' => 'H1', 'unit' => 'gm', 'status' => true]);
    $variant  = \App\Models\ProductVariant::create([
        'product_id' => $product->id, 'sku' => 'H1-1', 'value' => '100 gm', 'attributes' => ['Weight' => '100'],
        'price' => 500, 'is_default' => true, 'status' => true,
    ]);
    \App\Models\ProductStock::create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 10]);

    $this->item = ['product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 1, 'price' => 500];
    $country = \App\Models\Country::create(['name' => 'Pakistan', 'code' => 'PK']);
    $state   = \App\Models\State::create(['name' => 'Punjab', 'country_id' => $country->id]);
    $this->city = City::forceCreate(['name' => 'Lahore', 'state_id' => $state->id, 'province' => 'punjab', 'shipping_charges' => 200]);
});

it('remembers the address of the last order for the next checkout', function () {
    [$user] = app(\App\Services\CustomerIdentityService::class)
        ->findOrCreateByPhone('923009990000', ['first_name' => 'Ali']);
    $user->update(['must_change_password' => false]);

    $this->actingAs($user, 'sanctum')->postJson('/api/orders', [
        'items' => [$this->item], 'city_id' => $this->city->id,
        'shipping_address' => 'Ali, House 5 Street 2 Model Town, Lahore',
        'address_line' => 'House 5 Street 2 Model Town',
    ])->assertStatus(201);

    $this->actingAs($user, 'sanctum')->getJson('/api/user')->assertOk()
        ->assertJsonPath('data.customer.address', 'House 5 Street 2 Model Town')
        ->assertJsonPath('data.customer.city_id', $this->city->id);
});

it('saves the guest checkout address on the new account', function () {
    $this->postJson('/api/orders/guest', [
        'name' => 'Sara Khan', 'phone' => '03001112222', 'items' => [$this->item], 'city_id' => $this->city->id,
        'shipping_address' => 'Sara Khan, Flat 3 Gulberg, Lahore', 'address_line' => 'Flat 3 Gulberg',
    ])->assertStatus(201);

    $customer = \App\Models\Customer::where('phone', 'like', '%3001112222')->sole();
    expect($customer->address)->toBe('Flat 3 Gulberg')->and($customer->city_id)->toBe($this->city->id);
});
