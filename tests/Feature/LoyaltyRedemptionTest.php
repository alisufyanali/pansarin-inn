<?php

use App\Models\CustomerGroup;
use App\Models\GeneralSetting;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\PointTransaction;

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

    [$this->user, $this->customer] = app(\App\Services\CustomerIdentityService::class)
        ->findOrCreateByPhone(\App\Helpers\PhoneHelper::normalize('03009990000'), ['first_name' => 'Ali']);
    $this->user->update(['must_change_password' => false]);
    LoyaltyPoint::updateOrCreate(['customer_id' => $this->customer->id], ['balance' => 1234]);

    $this->item = [
        'product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 1, 'price' => 1000,
    ];
});

it('quotes a redemption at 50 points per rupee without deducting', function () {
    $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/rewards/redeem', ['points' => 1234, 'amount' => 1000])
        ->assertOk()
        ->assertJsonPath('data.redeem_points', 1200)   // only whole rupees: Rs 24
        ->assertJsonPath('data.discount', 24)
        ->assertJsonPath('data.min_points', 50)
        ->assertJsonPath('data.balance_after', 34);

    expect(LoyaltyPoint::where('customer_id', $this->customer->id)->value('balance'))->toBe(1234);
});

it('rejects fewer than 50 points and more than the balance', function () {
    $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/rewards/redeem', ['points' => 40, 'amount' => 1000])->assertStatus(422);
    $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/rewards/redeem', ['points' => 5000, 'amount' => 1000])->assertStatus(422);
});

it('spends points on an order and gives them back on cancel', function () {
    $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/orders', ['items' => [$this->item], 'shipping_address' => 'X', 'redeem_points' => 1000])
        ->assertStatus(201);

    $order = Order::sole();
    expect($order->points_redeemed)->toBe(1000)
        ->and($order->points_discount)->toBe(20.0)
        ->and($order->invoice_discount)->toBe(20.0)
        ->and(LoyaltyPoint::where('customer_id', $this->customer->id)->value('balance'))->toBe(234)
        ->and(PointTransaction::where('reference', $order->order_number)->value('points'))->toBe(-1000);

    $order->update(['status' => 'cancelled']);
    $order->update(['status' => 'pending']);
    $order->update(['status' => 'cancelled']);

    expect(LoyaltyPoint::where('customer_id', $this->customer->id)->value('balance'))->toBe(1234);
});

it('does not let guests redeem points', function () {
    $this->postJson('/api/checkout/quote', ['items' => [$this->item], 'redeem_points' => 100])
        ->assertOk()
        ->assertJsonPath('data.points_discount', 0)
        ->assertJsonPath('data.points_error', 'Please log in to use your reward points.');
});

it('includes points in the logged-in checkout quote', function () {
    $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/checkout/quote', ['items' => [$this->item], 'redeem_points' => 500])
        ->assertOk()
        ->assertJsonPath('data.points_redeemed', 500)
        ->assertJsonPath('data.points_discount', 10)
        ->assertJsonPath('data.grand_total', 1000 - 10 + 250);
});

it('refuses to redeem when the admin turned redemption off', function () {
    GeneralSetting::updateOrCreate(['type' => 'loyalty_redemption_rate'], ['value' => '0']);

    $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/orders', ['items' => [$this->item], 'shipping_address' => 'X', 'redeem_points' => 1000])
        ->assertStatus(422);
    expect(Order::count())->toBe(0);
});
