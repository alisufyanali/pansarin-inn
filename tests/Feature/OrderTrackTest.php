<?php

use App\Models\Customer;
use App\Models\CustomerGroup;
use App\Models\Order;
use App\Models\OrderItem;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

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

    $this->customer = Customer::create([
        'first_name' => 'Ali',
        'last_name'  => 'Hassan',
        'phone'      => '923001111111',
        'email'      => 'ali@gmail.com',
        'address'    => '123 Test Street, Karachi',
        'status'     => 'active',
        'customer_group_id' => CustomerGroup::where('is_default', true)->first()->id,
    ]);

    $this->order = Order::create([
        'customer_id'      => $this->customer->id,
        'customer_name'    => 'Ali Hassan',
        'customer_phone'   => '923001111111',
        'customer_email'   => 'ali@gmail.com',
        'shipping_address' => '123 Test Street, Karachi',
        'billing_address'  => '123 Test Street, Karachi',
        'status'           => 'pending',
        'payment_status'   => 'unpaid',
        'payment_method'   => 'cod',
        'order_note'       => 'Test note',
        'subtotal'         => 100,
        'grand_total'      => 100,
    ]);

    OrderItem::create([
        'order_id'           => $this->order->id,
        'product_id'         => $this->productId,
        'product_variant_id' => $this->variantId,
        'quantity'           => 1,
        'price'              => 100,
        'discount'           => 0,
        'subtotal'           => 100,
        'meta'               => [
            'product_name' => 'Test Herb',
            'variant_name' => '100 gm',
        ],
    ]);
});

it('(track) returns 200 with detailed order when order_number + phone match customer_phone snapshot', function () {
    $response = $this->getJson('/api/orders/track?' . http_build_query([
        'order_number' => $this->order->order_number,
        'phone'        => '03001111111',
    ]));

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'order_number',
                'status',
                'payment_status',
                'grand_total',
                'subtotal',
                'customer_name',
                'customer_phone',
                'items' => [
                    '*' => ['id', 'product_name', 'variant', 'quantity', 'price', 'subtotal'],
                ],
                'shipping_address',
                'billing_address',
                'order_note',
            ],
        ]);

    expect($response->json('data.id'))->toBe($this->order->id);
    expect($response->json('data.order_number'))->toBe($this->order->order_number);
    expect($response->json('data.items'))->toHaveCount(1);
    expect($response->json('data.shipping_address'))->toBe('123 Test Street, Karachi');
});

it('(track) returns 404 generic "Order not found." when phone is wrong (no hint which field failed)', function () {
    $response = $this->getJson('/api/orders/track?' . http_build_query([
        'order_number' => $this->order->order_number,
        'phone'        => '03009999999',
    ]));

    $response->assertStatus(404)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Order not found.')
        ->assertJsonMissingPath('errors');
});

it('(track) returns 404 generic "Order not found." when order_number is wrong (no hint)', function () {
    $response = $this->getJson('/api/orders/track?' . http_build_query([
        'order_number' => 'ORDER-99999',
        'phone'        => '03001111111',
    ]));

    $response->assertStatus(404)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Order not found.')
        ->assertJsonMissingPath('errors');
});

it('(track) returns 404 generic "Order not found." when phone cannot be normalized (invalid format)', function () {
    $response = $this->getJson('/api/orders/track?' . http_build_query([
        'order_number' => $this->order->order_number,
        'phone'        => 'not-a-phone-123',
    ]));

    $response->assertStatus(404)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Order not found.');
});

it('(track) accepts phone in various formats that normalize to same value (923XXXXXXXXX)', function ($phone) {
    $response = $this->getJson('/api/orders/track?' . http_build_query([
        'order_number' => $this->order->order_number,
        'phone'        => $phone,
    ]));

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.order_number', $this->order->order_number);
})->with([
    ['+923001111111'],
    ['00923001111111'],
    ['923001111111'],
    ['0300-111-1111'],
    ['92 300 111 1111'],
]);

it('(track) returns 422 when required params are missing', function () {
    $response = $this->getJson('/api/orders/track');
    $response->assertStatus(422);

    $response = $this->getJson('/api/orders/track?' . http_build_query(['order_number' => $this->order->order_number]));
    $response->assertStatus(422);

    $response = $this->getJson('/api/orders/track?' . http_build_query(['phone' => '03001111111']));
    $response->assertStatus(422);
});

it('(track) is public: works without auth:sanctum token', function () {
    $response = $this->getJson('/api/orders/track?' . http_build_query([
        'order_number' => $this->order->order_number,
        'phone'        => '03001111111',
    ]));

    $response->assertStatus(200);
});
