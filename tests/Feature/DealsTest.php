<?php

use App\Models\CustomerGroup;
use App\Models\Deal;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    $category = \App\Models\Category::create(['name' => 'Herbs', 'slug' => 'herbs', 'status' => true]);
    $this->makeProduct = function (string $slug, float $price) use ($category) {
        $p = \App\Models\Product::create([
            'category_id' => $category->id, 'name' => ucfirst($slug), 'slug' => $slug,
            'sku' => strtoupper($slug), 'unit' => 'gm', 'status' => true,
        ]);
        $v = \App\Models\ProductVariant::create([
            'product_id' => $p->id, 'sku' => strtoupper($slug) . '-1', 'value' => '100 gm',
            'attributes' => ['Weight' => '100 gm'], 'price' => $price, 'sale_price' => null,
            'is_default' => true, 'status' => true,
        ]);
        \App\Models\ProductStock::create(['product_id' => $p->id, 'product_variant_id' => $v->id, 'quantity' => 100]);

        return [$p, $v];
    };

    [$this->product, $this->variant] = ($this->makeProduct)('neem', 1000);
});

function makeDeal(array $attrs, array $products): Deal
{
    $deal = Deal::create(array_merge(['title' => 'Deal', 'is_active' => true], $attrs));
    $deal->products()->sync($products);

    return $deal;
}

function dealOrder(array $items, array $extra = [])
{
    return test()->postJson('/api/orders/guest', array_merge([
        'name' => 'Ali', 'phone' => '03001111111', 'shipping_address' => 'Street 1', 'items' => $items,
    ], $extra));
}

function line($variant, int $qty = 1, ?float $price = null): array
{
    return ['product_id' => $variant->product_id, 'product_variant_id' => $variant->id, 'quantity' => $qty, 'price' => $price ?? (float) $variant->price];
}

it('applies a percentage deal as a line discount and records usage', function () {
    $deal = makeDeal(['deal_type' => 'percentage', 'discount_value' => 20], [$this->product->id => []]);

    dealOrder([line($this->variant, 2)])->assertStatus(201);

    $item = Order::sole()->items->first();
    expect((float) $item->discount)->toBe(400.0)
        ->and($item->deal_id)->toBe($deal->id)
        ->and((float) Order::sole()->subtotal)->toBe(1600.0)
        ->and($deal->fresh()->current_uses)->toBe(1);
});

it('uses the per-product custom discount over the deal value', function () {
    makeDeal(['deal_type' => 'percentage', 'discount_value' => 20], [$this->product->id => ['custom_discount' => 50]]);

    dealOrder([line($this->variant, 1)])->assertStatus(201);

    expect((float) Order::sole()->items->first()->discount)->toBe(500.0);
});

it('accepts the deal price sent by the storefront but rejects anything lower', function () {
    makeDeal(['deal_type' => 'fixed', 'discount_value' => 100], [$this->product->id => []]);

    dealOrder([line($this->variant, 1, 900)])->assertStatus(201);
    expect((float) Order::sole()->items->first()->price)->toBe(1000.0)
        ->and((float) Order::sole()->items->first()->discount)->toBe(100.0);

    dealOrder([line($this->variant, 1, 500)])->assertStatus(422);
});

it('gives Y free units for every X+Y on a buy X get Y deal', function () {
    makeDeal(['deal_type' => 'buy_x_get_y', 'min_quantity' => 2, 'free_quantity' => 1], [$this->product->id => []]);

    dealOrder([line($this->variant, 7)])->assertStatus(201); // 2 full groups of 3 → 2 free

    expect((float) Order::sole()->items->first()->discount)->toBe(2000.0);
});

it('applies a bundle only when every bundle product is in the cart', function () {
    [$p2, $v2] = ($this->makeProduct)('tulsi', 500);
    makeDeal(['deal_type' => 'bundle', 'discount_value' => 10], [$this->product->id => [], $p2->id => []]);

    dealOrder([line($this->variant)])->assertStatus(201);
    expect((float) Order::sole()->items->first()->discount)->toBe(0.0);

    Order::query()->forceDelete();
    dealOrder([line($this->variant), line($v2)])->assertStatus(201);
    expect((float) Order::sole()->items->sum('discount'))->toBe(150.0);
});

it('ignores inactive, expired and exhausted deals', function () {
    makeDeal(['title' => 'Off', 'deal_type' => 'percentage', 'discount_value' => 50, 'is_active' => false], [$this->product->id => []]);
    makeDeal(['title' => 'Old', 'deal_type' => 'percentage', 'discount_value' => 50, 'ends_at' => now()->subDay()], [$this->product->id => []]);
    makeDeal(['title' => 'Used up', 'deal_type' => 'percentage', 'discount_value' => 50, 'max_uses' => 1, 'current_uses' => 1], [$this->product->id => []]);

    dealOrder([line($this->variant)])->assertStatus(201);

    expect((float) Order::sole()->items->first()->discount)->toBe(0.0);
});

it('respects the deal min purchase amount', function () {
    makeDeal(['deal_type' => 'percentage', 'discount_value' => 10, 'min_purchase_amount' => 5000], [$this->product->id => []]);

    dealOrder([line($this->variant, 1)])->assertStatus(201);

    expect((float) Order::sole()->items->first()->discount)->toBe(0.0);
});

it('limits deal units to the stock limit and tracks sold count', function () {
    $deal = makeDeal(['deal_type' => 'fixed', 'discount_value' => 100], [$this->product->id => ['stock_limit' => 3]]);

    dealOrder([line($this->variant, 5)])->assertStatus(201);

    expect((float) Order::sole()->items->first()->discount)->toBe(300.0)
        ->and((int) DB::table('deal_product')->where('deal_id', $deal->id)->value('sold_count'))->toBe(3);
});

it('enforces max uses per customer', function () {
    makeDeal(['deal_type' => 'fixed', 'discount_value' => 100, 'max_uses_per_user' => 1], [$this->product->id => []]);

    dealOrder([line($this->variant)])->assertStatus(201);
    dealOrder([line($this->variant)])->assertStatus(422);

    expect(Order::count())->toBe(1);
});

it('gives deal usage back when the order is cancelled', function () {
    $deal = makeDeal(['deal_type' => 'fixed', 'discount_value' => 100], [$this->product->id => ['stock_limit' => 10]]);
    dealOrder([line($this->variant, 2)])->assertStatus(201);

    Order::sole()->update(['status' => 'cancelled']);

    expect($deal->fresh()->current_uses)->toBe(0)
        ->and((int) DB::table('deal_product')->where('deal_id', $deal->id)->value('sold_count'))->toBe(0);
});

it('stacks a coupon on top of the deal-discounted subtotal', function () {
    makeDeal(['deal_type' => 'percentage', 'discount_value' => 20], [$this->product->id => []]);
    \App\Models\Coupon::create(['code' => 'TEN', 'discount_type' => 'percentage', 'discount_value' => 10, 'apply_to' => 'order', 'is_active' => true]);

    dealOrder([line($this->variant, 1)], ['coupon_code' => 'TEN'])->assertStatus(201);

    expect((float) Order::sole()->invoice_discount)->toBe(80.0);
});

it('quotes the same totals the order will charge', function () {
    makeDeal(['deal_type' => 'percentage', 'discount_value' => 20], [$this->product->id => []]);

    $this->postJson('/api/checkout/quote', ['items' => [line($this->variant, 2)], 'coupon_code' => 'NOPE'])
        ->assertOk()
        ->assertJsonPath('data.subtotal', 2000)
        ->assertJsonPath('data.deal_discount', 400)
        ->assertJsonPath('data.shipping', 250)
        ->assertJsonPath('data.grand_total', 1850)
        ->assertJsonPath('data.coupon_error', 'This coupon is no longer valid. Please remove it and try again.');
});

it('exposes deals on the product API and the deals API', function () {
    makeDeal(['title' => 'Winter Sale', 'deal_type' => 'percentage', 'discount_value' => 25], [$this->product->id => []]);

    $this->getJson('/api/products/neem')
        ->assertOk()
        ->assertJsonPath('data.deal.title', 'Winter Sale')
        ->assertJsonPath('data.deal.badge_text', '25% OFF')
        ->assertJsonPath('data.deal_price', 750)
        ->assertJsonPath('data.variants.0.deal_price', 750);

    $this->getJson('/api/deals')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Winter Sale')
        ->assertJsonPath('data.0.products.0.slug', 'neem')
        ->assertJsonPath('data.0.products.0.variants.0.deal_price', 750);

    $this->getJson('/api/products')->assertOk()->assertJsonPath('data.0.deal_price', 750);
});

it('lets admins toggle and duplicate deals', function () {
    $role = Role::create(['name' => 'manager', 'guard_name' => 'web']);
    $role->givePermissionTo(Permission::create(['name' => 'edit.deals', 'guard_name' => 'web']));
    $admin = User::factory()->create();
    $admin->assignRole($role);
    $deal = makeDeal(['deal_type' => 'percentage', 'discount_value' => 10], [$this->product->id => []]);

    $this->actingAs($admin)->post("/admin/deals/{$deal->id}/toggle-status")->assertRedirect();
    expect($deal->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)->post("/admin/deals/{$deal->id}/duplicate")->assertRedirect();
    expect(Deal::count())->toBe(2);
});

it('hides deals that have no active products', function () {
    makeDeal(['title' => 'Empty', 'deal_type' => 'percentage', 'discount_value' => 10], []);

    $this->getJson('/api/deals')->assertOk()->assertJsonCount(0, 'data');
});
