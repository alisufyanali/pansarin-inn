<?php

use App\Models\Coupon;
use App\Models\CustomerGroup;
use App\Models\Order;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    $category = \App\Models\Category::create(['name' => 'Test', 'slug' => 'test', 'status' => true]);
    $product  = \App\Models\Product::create([
        'category_id' => $category->id, 'name' => 'Test Herb', 'slug' => 'test-herb',
        'sku' => 'TH-001', 'unit' => 'gm', 'status' => true,
    ]);
    $variant = \App\Models\ProductVariant::create([
        'product_id' => $product->id, 'sku' => 'TH-001-100', 'value' => '100 gm',
        'attributes' => ['Weight' => '100 gm'], 'price' => 1000, 'sale_price' => null,
        'is_default' => true, 'status' => true,
    ]);
    \App\Models\ProductStock::create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 50]);

    $this->category  = $category;
    $this->productId = $product->id;
    $this->variantId = $variant->id;
});

function guestOrder(array $overrides = [], array $item = []): array
{
    return array_merge([
        'name'             => 'Ali Hassan',
        'phone'            => '03001111111',
        'shipping_address' => '123 Test Street',
        'items'            => [array_merge([
            'product_id'         => test()->productId,
            'product_variant_id' => test()->variantId,
            'quantity'           => 1,
            'price'              => 1000,
        ], $item)],
    ], $overrides);
}

it('rejects an item price below the catalogue price', function () {
    $this->postJson('/api/orders/guest', guestOrder([], ['price' => 1]))
        ->assertStatus(422);
    expect(Order::count())->toBe(0);
});

it('ignores a client-sent invoice discount and item discount', function () {
    $this->postJson('/api/orders/guest', guestOrder(['invoice_discount' => 900], ['discount' => 500]))
        ->assertStatus(201);

    $order = Order::sole();
    expect((float) $order->invoice_discount)->toBe(0.0)
        ->and((float) $order->subtotal)->toBe(1000.0);
});

it('applies a coupon server-side and counts its usage', function () {
    $coupon = Coupon::create([
        'code' => 'SAVE10', 'discount_type' => 'percentage', 'discount_value' => 10,
        'apply_to' => 'order', 'is_active' => true,
    ]);

    $this->postJson('/api/orders/guest', guestOrder(['coupon_code' => 'save10']))->assertStatus(201);

    $order = Order::sole();
    expect((float) $order->invoice_discount)->toBe(100.0)
        ->and($order->coupon_code)->toBe('SAVE10')
        ->and($coupon->fresh()->usage_count)->toBe(1);
});

it('enforces the per-customer coupon limit', function () {
    Coupon::create([
        'code' => 'ONCE', 'discount_type' => 'fixed', 'discount_value' => 50,
        'apply_to' => 'order', 'per_user_limit' => 1, 'is_active' => true,
    ]);

    $this->postJson('/api/orders/guest', guestOrder(['coupon_code' => 'ONCE']))->assertStatus(201);
    $this->postJson('/api/orders/guest', guestOrder(['coupon_code' => 'ONCE']))->assertStatus(422);

    expect(Order::count())->toBe(1);
});

it('rejects a product coupon when that product is not in the cart', function () {
    $other = \App\Models\Product::create([
        'category_id' => $this->category->id, 'name' => 'Other', 'slug' => 'other',
        'sku' => 'OT-1', 'unit' => 'gm', 'status' => true,
    ]);
    Coupon::create([
        'code' => 'OTHER', 'discount_type' => 'fixed', 'discount_value' => 50,
        'apply_to' => 'product', 'product_id' => $other->id, 'is_active' => true,
    ]);

    $this->postJson('/api/orders/guest', guestOrder(['coupon_code' => 'OTHER']))->assertStatus(422);
});

it('keeps a coupon valid for the whole of its end date', function () {
    $coupon = new Coupon(['is_active' => true, 'end_date' => now()->toDateString()]);
    expect($coupon->isValid())->toBeTrue();
});
