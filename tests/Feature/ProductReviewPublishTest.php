<?php

use App\Models\Order;
use App\Models\ProductReview;

beforeEach(function () {
    \App\Models\CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    $category = \App\Models\Category::create(['name' => 'Test', 'slug' => 'test', 'status' => true]);
    $this->product = \App\Models\Product::create([
        'category_id' => $category->id, 'name' => 'Test Herb', 'slug' => 'test-herb',
        'sku' => 'TH-001', 'unit' => 'gm', 'status' => true,
    ]);
});

function deliveredOrderFor($customer, $product): Order
{
    $order = Order::create([
        'customer_id' => $customer->id, 'status' => 'pending', 'payment_status' => 'unpaid',
        'customer_email' => 'ali@example.com', 'customer_phone' => '923009990000',
    ]);
    $order->items()->create(['product_id' => $product->id, 'quantity' => 1, 'price' => 100, 'subtotal' => 100]);
    $order->forceFill(['status' => 'delivered'])->saveQuietly();

    return $order;
}

it('shows a guest review right away as unverified', function () {
    $this->postJson('/api/products/test-herb/reviews', ['name' => 'Guest', 'rating' => 4, 'comment' => 'Nice and fresh herbs'])
        ->assertStatus(201)
        ->assertJsonPath('data.customer_name', 'Guest')
        ->assertJsonPath('data.is_verified', false);

    $this->getJson('/api/products/test-herb/reviews')
        ->assertOk()
        ->assertJsonPath('data.stats.total', 1)
        ->assertJsonPath('data.reviews.0.is_verified', false);
});

it('marks a logged-in buyer of the product as verified', function () {
    [$user, $customer] = app(\App\Services\CustomerIdentityService::class)
        ->findOrCreateByPhone('923009990000', ['first_name' => 'Ali']);
    deliveredOrderFor($customer, $this->product);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/products/test-herb/reviews', ['name' => 'Ali', 'rating' => 5, 'comment' => 'Bought it and loved it'])
        ->assertStatus(201)
        ->assertJsonPath('data.is_verified', true);
});

it('verifies a guest with the order number and the phone of that order', function () {
    [, $customer] = app(\App\Services\CustomerIdentityService::class)
        ->findOrCreateByPhone('923009990000', ['first_name' => 'Ali']);
    $order = deliveredOrderFor($customer, $this->product);

    $this->postJson('/api/products/test-herb/reviews', [
        'name' => 'Ali', 'rating' => 5, 'comment' => 'Bought it and loved it',
        'order_number' => $order->order_number, 'phone' => '0300-9990000',
    ])->assertStatus(201)->assertJsonPath('data.is_verified', true);

    expect(ProductReview::sole()->status)->toBeTruthy();
});

it('does not verify a guest who only knows the order number', function () {
    [, $customer] = app(\App\Services\CustomerIdentityService::class)
        ->findOrCreateByPhone('923009990000', ['first_name' => 'Ali']);
    $order = deliveredOrderFor($customer, $this->product);

    $this->postJson('/api/products/test-herb/reviews', [
        'name' => 'Someone', 'rating' => 1, 'comment' => 'Pretending to be a buyer',
        'order_number' => $order->order_number, 'phone' => '03111111111',
    ])->assertStatus(201)->assertJsonPath('data.is_verified', false);
});
