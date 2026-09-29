<?php

use App\Models\CustomerGroup;
use App\Models\Order;
use App\Models\ProductVariant;

it('builds labels with the unit in the right place', function (array $attrs, ?string $value, string $unit, string $expected) {
    expect(ProductVariant::labelFor($attrs, $value, $unit))->toBe($expected);
})->with([
    'weight + form' => [['Weight' => '250', 'Form' => 'Powder'], '250 - Powder', 'gm', '250 gm / Powder'],
    'form first'    => [['Form' => 'Whole', 'Weight' => '100'], null, 'gm', '100 gm / Whole'],
    'oil size'      => [['Size' => '30'], '30', 'ml', '30 ml'],
    'pack'          => [['Pack' => '100'], '100', 'gm', '100 gm'],
    'unit in value' => [['Weight' => '1 Pack'], null, 'Pc', '1 Pack'],
    'no attributes' => [[], '1 Pc', 'Pc', '1 Pc'],
    'plain number'  => [[], '5', 'Pc', '5 Pc'],
]);

it('stores the unit label on order items and returns it in the order API', function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    $category = \App\Models\Category::create(['name' => 'Herbs', 'slug' => 'herbs', 'status' => true]);
    $product  = \App\Models\Product::create(['category_id' => $category->id, 'name' => 'Neem', 'slug' => 'neem', 'sku' => 'N1', 'unit' => 'gm', 'status' => true]);
    $variant  = ProductVariant::create([
        'product_id' => $product->id, 'sku' => 'N1-250P', 'value' => '250 - Powder',
        'attributes' => ['Weight' => '250', 'Form' => 'Powder'], 'price' => 500, 'is_default' => true, 'status' => true,
    ]);
    \App\Models\ProductStock::create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 10]);

    $this->postJson('/api/orders/guest', [
        'name' => 'Ali', 'phone' => '03001111111', 'shipping_address' => 'Street 1',
        'items' => [['product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 1, 'price' => 500]],
    ])->assertStatus(201);

    $order = Order::sole();
    expect($order->items->first()->meta['variant_name'])->toBe('250 gm / Powder');

    $this->getJson('/api/orders/track?order_number=' . $order->order_number . '&phone=03001111111')
        ->assertOk()
        ->assertJsonPath('data.items.0.variant', '250 gm / Powder');
});

it('rewrites old stored labels with the fix command', function () {
    $category = \App\Models\Category::create(['name' => 'Oils', 'slug' => 'oils', 'status' => true]);
    $product  = \App\Models\Product::create(['category_id' => $category->id, 'name' => 'Egg Oil', 'slug' => 'egg-oil', 'sku' => 'E1', 'unit' => 'ml', 'status' => true]);
    $variant  = ProductVariant::create(['product_id' => $product->id, 'sku' => 'E1-30', 'value' => '30', 'attributes' => ['Size' => '30'], 'price' => 300, 'status' => true]);
    $customer = \App\Models\Customer::create(['first_name' => 'A', 'phone' => '923002223333', 'status' => 'active']);
    $order    = Order::create(['customer_id' => $customer->id, 'status' => 'pending', 'payment_status' => 'unpaid']);
    $item     = $order->items()->create([
        'product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 1,
        'price' => 300, 'subtotal' => 300, 'meta' => ['product_name' => 'Egg Oil', 'variant_name' => '30'],
    ]);

    $this->artisan('orders:fix-variant-labels --dry-run')->assertSuccessful();
    expect($item->fresh()->meta['variant_name'])->toBe('30');

    $this->artisan('orders:fix-variant-labels')->assertSuccessful();
    expect($item->fresh()->meta['variant_name'])->toBe('30 ml');
});
