<?php

use App\Models\Coupon;
use App\Models\CustomerGroup;
use App\Models\Order;
use App\Models\ProductStock;

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
        'attributes' => ['Weight' => '100 gm'], 'price' => 100, 'sale_price' => null,
        'is_default' => true, 'status' => true,
    ]);
    ProductStock::create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 10]);

    $this->productId = $product->id;
    $this->variantId = $variant->id;
});

function stockNow(): float
{
    return (float) ProductStock::where('product_variant_id', test()->variantId)->value('quantity');
}

function placeOrder(int $qty = 2, array $extra = [], ?array $items = null)
{
    return test()->postJson('/api/orders/guest', array_merge([
        'name' => 'Ali', 'phone' => '03001111111', 'shipping_address' => 'Street 1',
        'items' => $items ?? [[
            'product_id' => test()->productId, 'product_variant_id' => test()->variantId,
            'quantity' => $qty, 'price' => 100,
        ]],
    ], $extra));
}

it('deducts stock once even after the order is delivered', function () {
    placeOrder(2)->assertStatus(201);
    expect(stockNow())->toBe(8.0);

    Order::sole()->update(['status' => 'delivered']);
    expect(stockNow())->toBe(8.0);
});

it('puts stock back when the order is cancelled, only once', function () {
    placeOrder(3)->assertStatus(201);
    $order = Order::sole();

    $order->update(['status' => 'cancelled']);
    expect(stockNow())->toBe(10.0);

    $order->restoreStock();
    expect(stockNow())->toBe(10.0);
});

it('does not restock twice when a cancelled order is deleted', function () {
    placeOrder(3)->assertStatus(201);
    $order = Order::sole();
    $order->update(['status' => 'cancelled']);

    app(\App\Http\Repositories\Admin\OrderRepository::class)->delete($order->id);
    expect(stockNow())->toBe(10.0);
});

it('releases the coupon use when the order is cancelled', function () {
    $coupon = Coupon::create([
        'code' => 'TEN', 'discount_type' => 'fixed', 'discount_value' => 10,
        'apply_to' => 'order', 'is_active' => true,
    ]);
    placeOrder(1, ['coupon_code' => 'TEN'])->assertStatus(201);
    expect($coupon->fresh()->usage_count)->toBe(1);

    Order::sole()->update(['status' => 'cancelled']);
    expect($coupon->fresh()->usage_count)->toBe(0);
});

it('checks stock against the total of duplicate lines', function () {
    $line = ['product_id' => $this->productId, 'product_variant_id' => $this->variantId, 'quantity' => 6, 'price' => 100];

    placeOrder(items: [$line, $line])->assertStatus(422);
    expect(stockNow())->toBe(10.0);
});

it('restocks returned items once when the return is completed', function () {
    placeOrder(4)->assertStatus(201);
    $order = Order::sole();
    $return = \App\Models\ReturnRequest::create([
        'order_id' => $order->id, 'user_id' => $order->customer->user_id,
        'status' => 'pending', 'reason_category' => 'defective',
    ]);
    \App\Models\ReturnRequestItem::create([
        'return_request_id' => $return->id, 'order_item_id' => $order->items->first()->id, 'quantity' => 2,
    ]);

    $repo = app(\App\Http\Repositories\Admin\ReturnRequestRepository::class);
    $repo->updateStatus($return->id, 'completed');
    $repo->updateStatus($return->id, 'completed');

    expect(stockNow())->toBe(8.0);
});

it('marks the order delivered when its sale is delivered, crediting points once', function () {
    placeOrder(2)->assertStatus(201);
    $order = Order::sole();

    $sale = \App\Models\Sale::create([
        'order_id' => $order->id, 'customer_id' => $order->customer_id,
        'delivery_status' => 'processing', 'payment_status' => 'unpaid',
    ]);
    expect($order->fresh()->status)->toBe('pending');

    $sale->update(['delivery_status' => 'delivered']);
    $order->refresh();

    expect($order->status)->toBe('delivered')
        ->and($order->delivered_at)->not->toBeNull()
        ->and(stockNow())->toBe(8.0)
        ->and(\App\Models\PointTransaction::where('reference', $order->order_number)->count())->toBe(1);
});

it('cancels the order and restocks when its sale is cancelled', function () {
    placeOrder(2)->assertStatus(201);
    $order = Order::sole();

    \App\Models\Sale::create([
        'order_id' => $order->id, 'customer_id' => $order->customer_id,
        'delivery_status' => 'cancelled', 'payment_status' => 'unpaid',
    ]);

    expect($order->fresh()->status)->toBe('cancelled')
        ->and(stockNow())->toBe(10.0);
});
