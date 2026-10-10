<?php

use App\Http\Repositories\Admin\ReturnRequestRepository;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\ProductStock;
use App\Models\ReturnRequest;
use App\Models\Sale;
use App\Models\User;

beforeEach(function () {
    \App\Models\CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    $cat = \App\Models\Category::create(['name' => 'T', 'slug' => 't', 'status' => true]);
    $product = \App\Models\Product::create(['category_id' => $cat->id, 'name' => 'Herb', 'slug' => 'herb-x', 'sku' => 'HX', 'unit' => 'gm', 'status' => true]);
    $this->variant = \App\Models\ProductVariant::create(['product_id' => $product->id, 'sku' => 'HX-1', 'value' => '100 gm', 'attributes' => ['Weight' => '100'], 'price' => 1000, 'is_default' => true, 'status' => true]);
    ProductStock::create(['product_id' => $product->id, 'product_variant_id' => $this->variant->id, 'quantity' => 10]);

    // Logged-in customer places a 2 × Rs 1,000 order (+ shipping)
    [$this->user, $this->customer] = app(\App\Services\CustomerIdentityService::class)
        ->findOrCreateByPhone(\App\Helpers\PhoneHelper::normalize('03009990000'), ['first_name' => 'Ali']);
    $this->user->update(['must_change_password' => false]);
    $this->actingAs($this->user, 'sanctum')->postJson('/api/orders', [
        'shipping_address' => 'X',
        'items' => [['product_id' => $product->id, 'product_variant_id' => $this->variant->id, 'quantity' => 2, 'price' => 1000]],
    ])->assertStatus(201);
    $this->order = Order::sole();

    $this->stock  = fn () => (int) ProductStock::where('product_variant_id', $this->variant->id)->value('quantity');
    $this->points = fn () => (int) LoyaltyPoint::where('customer_id', $this->customer->id)->value('balance');
    $this->deliver = function () {
        $sale = Sale::create(['order_id' => $this->order->id, 'customer_id' => $this->customer->id, 'delivery_status' => 'pending', 'payment_status' => 'paid']);
        $sale->update(['delivery_status' => 'delivered']);
        return $sale;
    };
    $this->completeReturn = function (int $qty) {
        $r = ReturnRequest::create(['order_id' => $this->order->id, 'user_id' => $this->user->id, 'status' => 'approved', 'reason_category' => 'defective']);
        $r->items()->create(['order_item_id' => $this->order->items()->first()->id, 'quantity' => $qty]);
        app(ReturnRequestRepository::class)->updateStatus($r->id, 'completed', ['refund_amount' => 1000 * $qty]);
        return $r;
    };
});

it('earns 1 point per Rs 100 on delivery, once', function () {
    $total = (float) $this->order->grand_total;
    ($this->deliver)();

    expect(($this->points)())->toBe((int) floor($total / 100))
        ->and(($this->stock)())->toBe(8);
});

it('takes points back in proportion to a partial return, then everything on the full return', function () {
    ($this->deliver)();
    $earned = ($this->points)();

    ($this->completeReturn)(1);   // half the goods
    expect(($this->stock)())->toBe(9)
        ->and(($this->points)())->toBe($earned - (int) floor($earned * 0.5))
        ->and($this->order->fresh()->status)->toBe('delivered');

    ($this->completeReturn)(1);   // the rest
    expect(($this->stock)())->toBe(10)              // never more than was taken out
        ->and(($this->points)())->toBe(0)
        ->and($this->order->fresh()->status)->toBe('refunded');
});

it('reverses everything when the order is marked Returned, and only once', function () {
    ($this->deliver)();
    $this->order->fresh()->update(['status' => 'refunded']);

    expect(($this->stock)())->toBe(10)->and(($this->points)())->toBe(0);

    // Running the reversal again changes nothing
    app(\App\Services\OrderReturnService::class)->reverseOrder($this->order->fresh());
    expect(($this->stock)())->toBe(10)
        ->and(PointTransaction::where('reason', 'order_returned')->count())->toBe(1);
});

it('treats a sale marked Returned as a returned order', function () {
    $sale = ($this->deliver)();
    $sale->update(['delivery_status' => 'returned']);

    expect($this->order->fresh()->status)->toBe('refunded')
        ->and(($this->stock)())->toBe(10)
        ->and(($this->points)())->toBe(0);
});

it('never takes the balance below zero when the points were already spent', function () {
    ($this->deliver)();
    LoyaltyPoint::where('customer_id', $this->customer->id)->update(['balance' => 3]); // spent most of them

    $this->order->fresh()->update(['status' => 'refunded']);
    expect(($this->points)())->toBe(0);
});

it('reverses the affiliate commission on a returned order', function () {
    ($this->deliver)();
    $affUser   = User::create(['name' => 'Aff', 'email' => 'aff@x.com', 'password' => 'x']);
    $affiliate = Affiliate::create(['user_id' => $affUser->id, 'affiliate_code' => 'AFF1', 'status' => 'active', 'balance' => 300]);
    AffiliateCommission::create([
        'affiliate_id' => $affiliate->id, 'order_id' => $this->order->id, 'order_subtotal' => 2000,
        'order_grand_total' => 2250, 'commission_percentage' => 0, 'commission_amount' => 100, 'status' => 'earned',
    ]);

    $this->order->fresh()->update(['status' => 'refunded']);

    expect(AffiliateCommission::sole()->status)->toBe('cancelled')
        ->and((float) $affiliate->fresh()->balance)->toBe(200.0);
});

it('does not let a guest order be returned online', function () {
    ($this->deliver)();
    $this->order->forceFill(['user_id' => null])->save();   // placed without signing in

    $this->actingAs($this->user, 'sanctum')->postJson('/api/returns', [
        'order_id' => $this->order->id, 'reason_category' => 'defective',
        'items' => [['order_item_id' => $this->order->items()->first()->id, 'quantity' => 1]],
    ])->assertStatus(403)->assertJsonPath('success', false);

    expect(ReturnRequest::count())->toBe(0);
});

it('lets a signed-in customer request a return of a delivered order', function () {
    ($this->deliver)();

    $this->actingAs($this->user, 'sanctum')->postJson('/api/returns', [
        'order_id' => $this->order->id, 'reason_category' => 'defective',
        'items' => [['order_item_id' => $this->order->items()->first()->id, 'quantity' => 1]],
    ])->assertSuccessful();

    expect(ReturnRequest::sole()->status)->toBe('pending');
});
