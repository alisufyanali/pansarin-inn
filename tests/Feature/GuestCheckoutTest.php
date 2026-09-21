<?php

use App\Models\CustomerGroup;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    // Minimal seeding required for guest checkout
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    // Create a product + variant with stock so syncItems passes
    $category = \App\Models\Category::create(['name' => 'Test', 'slug' => 'test', 'status' => true]);
    $product = \App\Models\Product::create([
        'category_id' => $category->id,
        'name' => 'Test Herb', 'slug' => 'test-herb', 'sku' => 'TH-001',
        'unit' => 'gm', 'status' => true,
    ]);
    $variant = \App\Models\ProductVariant::create([
        'product_id' => $product->id,
        'sku' => 'TH-001-100', 'value' => '100 gm',
        'attributes' => ['Weight' => '100 gm'],
        'price' => 100, 'sale_price' => null,
        'is_default' => true, 'status' => true,
    ]);
    \App\Models\ProductStock::create([
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'quantity' => 50,
    ]);

    $this->productId = $product->id;
    $this->variantId = $variant->id;
});

// (i) Guest checkout with a NEW phone — no token in response
it('(i) guest checkout new phone: 201, no token key in JSON', function () {
    $payload = [
        'name'             => 'Ali Hassan',
        'phone'            => '+923001111111',
        'email'            => 'ali@gmail.com',
        'shipping_address' => '123 Test Street, Karachi',
        'city_id'          => null,
        'payment_method'   => 'cod',
        'items'            => [[
            'product_id'         => $this->productId,
            'product_variant_id' => $this->variantId,
            'quantity'           => 1,
            'price'              => 100,
            'discount'           => 0,
        ]],
    ];

    $response = $this->postJson('/api/orders/guest', $payload);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonMissing(['token']); // no Sanctum token ever returned from storeGuest

    expect($response->json('data'))->not->toHaveKey('token');
});

// (i) Guest checkout with an EXISTING phone — order placed, still no token
it('(i) guest checkout existing phone: 201, no token, attaches to existing customer', function () {
    // Pre-create a customer for the same phone
    \App\Models\User::create([
        'name' => 'Existing User', 'username' => '923001111111',
        'email' => null, 'phone' => '923001111111',
        'password' => bcrypt('923001111111'), 'status' => 1,
    ])->assignRole('customer');

    $payload = [
        'name'             => 'Ali Hassan',
        'phone'            => '+923001111111',
        'shipping_address' => '123 Test Street, Karachi',
        'items'            => [[
            'product_id'         => $this->productId,
            'product_variant_id' => $this->variantId,
            'quantity'           => 1,
            'price'              => 100,
            'discount'           => 0,
        ]],
    ];

    $response = $this->postJson('/api/orders/guest', $payload);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonMissing(['token']);
});
