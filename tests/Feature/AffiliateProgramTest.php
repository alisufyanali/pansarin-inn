<?php

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliateSetting;
use App\Models\CustomerGroup;
use App\Models\Order;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'affiliate', 'guard_name' => 'web']);
    $this->adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    AffiliateSetting::create(['key' => 'default_commission', 'value' => '150']);

    $category = \App\Models\Category::create(['name' => 'Herbs', 'slug' => 'herbs', 'status' => true]);
    $product  = \App\Models\Product::create(['category_id' => $category->id, 'name' => 'Neem', 'slug' => 'neem', 'sku' => 'N1', 'unit' => 'gm', 'status' => true]);
    $this->variant = \App\Models\ProductVariant::create([
        'product_id' => $product->id, 'sku' => 'N1-1', 'value' => '100 gm', 'attributes' => ['Weight' => '100 gm'],
        'price' => 1000, 'is_default' => true, 'status' => true,
    ]);
    \App\Models\ProductStock::create(['product_id' => $product->id, 'product_variant_id' => $this->variant->id, 'quantity' => 100]);
});

function applyPayload(array $o = []): array
{
    return array_merge([
        'name' => 'Sara Khan', 'email' => 'sara@example.com', 'phone' => '03001230000',
        'password' => 'Secret#123', 'password_confirmation' => 'Secret#123',
        'payment_method' => 'easypaisa', 'payment_account_no' => '03001230000', 'about' => 'Instagram, 20k followers',
    ], $o);
}

function activeAffiliate(): Affiliate
{
    test()->postJson('/api/affiliate/apply', applyPayload())->assertStatus(201);
    $affiliate = Affiliate::sole();
    $affiliate->update(['status' => 'active']);

    return $affiliate;
}

function guestOrderWithRef(string $phone, ?string $ref)
{
    return test()->postJson('/api/orders/guest', [
        'name' => 'Buyer', 'phone' => $phone, 'shipping_address' => 'Street 1', 'ref' => $ref,
        'items' => [['product_id' => test()->variant->product_id, 'product_variant_id' => test()->variant->id, 'quantity' => 1, 'price' => 1000]],
    ]);
}

it('accepts an application from the storefront as pending', function () {
    $this->postJson('/api/affiliate/apply', applyPayload())
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.code', null);

    $affiliate = Affiliate::sole();
    $user = $affiliate->user;
    expect($affiliate->status)->toBe('pending')
        ->and($affiliate->notes)->toBe('Instagram, 20k followers')
        ->and($user->hasRole('affiliate'))->toBeFalse()
        ->and(\Illuminate\Support\Facades\Hash::check('Secret#123', $user->password))->toBeTrue()
        ->and($user->must_change_password)->toBeFalse();
});

it('refuses a public application for an existing account', function () {
    $this->postJson('/api/affiliate/apply', applyPayload())->assertStatus(201);

    $this->postJson('/api/affiliate/apply', applyPayload(['email' => 'other@example.com']))->assertStatus(422);
    expect(Affiliate::count())->toBe(1);
});

it('lets a signed-in customer apply and see the status', function () {
    [$user] = app(\App\Services\CustomerIdentityService::class)
        ->findOrCreateByPhone(\App\Helpers\PhoneHelper::normalize('03009990000'), ['first_name' => 'Ali']);
    $user->update(['must_change_password' => false]);

    $this->actingAs($user, 'sanctum')->postJson('/api/affiliate/apply-me', ['about' => 'Blog'])->assertStatus(201);
    $this->actingAs($user, 'sanctum')->getJson('/api/affiliate/status')->assertJsonPath('data.status', 'pending');
});

it('lets an admin approve, block and set the commission', function () {
    $this->postJson('/api/affiliate/apply', applyPayload())->assertStatus(201);
    $affiliate = Affiliate::sole();
    $admin = User::factory()->create();
    $admin->assignRole($this->adminRole);

    $this->actingAs($admin)->patch(route('admin.affiliate.approve', $affiliate->id))->assertRedirect();
    expect($affiliate->fresh()->status)->toBe('active')
        ->and($affiliate->user->fresh()->hasRole('affiliate'))->toBeTrue();

    $this->actingAs($admin)->patch(route('admin.affiliate.commission', $affiliate->id), ['fixed_commission' => 200])->assertRedirect();
    expect($affiliate->fresh()->commissionPerOrder())->toBe(200.0);

    $this->actingAs($admin)->patch(route('admin.affiliate.block', $affiliate->id))->assertRedirect();
    expect($affiliate->fresh()->status)->toBe('blocked')
        ->and($affiliate->user->fresh()->hasRole('affiliate'))->toBeFalse();

    $this->actingAs($admin)->get('/admin/affiliates')->assertOk();
});

it('pays a fixed commission once when a referred guest order is delivered', function () {
    $affiliate = activeAffiliate();

    guestOrderWithRef('03004440000', $affiliate->affiliate_code)->assertStatus(201);
    $order = Order::sole();
    expect($order->customer->user->referred_by)->toBe($affiliate->user_id);

    $order->update(['status' => 'delivered']);
    $order->update(['status' => 'processing']);
    $order->update(['status' => 'delivered']);

    expect(AffiliateCommission::count())->toBe(1)
        ->and((float) AffiliateCommission::sole()->commission_amount)->toBe(150.0)
        ->and((float) $affiliate->fresh()->balance)->toBe(150.0);
});

it('does not re-assign an existing customer through a guest order', function () {
    $affiliate = activeAffiliate();
    app(\App\Services\CustomerIdentityService::class)
        ->findOrCreateByPhone(\App\Helpers\PhoneHelper::normalize('03005550000'), ['first_name' => 'Old']);

    guestOrderWithRef('03005550000', $affiliate->affiliate_code)->assertStatus(201);

    expect(Order::sole()->customer->user->referred_by)->toBeNull();
});

it('attaches the referral on storefront registration', function () {
    $affiliate = activeAffiliate();

    $this->postJson('/api/register', ['name' => 'New', 'phone' => '03006660000', 'ref' => strtolower($affiliate->affiliate_code)])
        ->assertStatus(201);

    expect(User::where('username', \App\Helpers\PhoneHelper::normalize('03006660000'))->value('referred_by'))
        ->toBe($affiliate->user_id);
});

it('ignores codes of pending or blocked affiliates', function () {
    $this->postJson('/api/affiliate/apply', applyPayload())->assertStatus(201);
    $affiliate = Affiliate::sole(); // still pending

    $this->postJson('/api/affiliate/click', ['ref' => $affiliate->affiliate_code])->assertJsonPath('data.valid', false);
    guestOrderWithRef('03007770000', $affiliate->affiliate_code)->assertStatus(201);

    expect(Order::sole()->customer->user->referred_by)->toBeNull();
});

it('records clicks for an active code', function () {
    $affiliate = activeAffiliate();

    $this->postJson('/api/affiliate/click', ['ref' => $affiliate->affiliate_code, 'url' => '/neem'])
        ->assertJsonPath('data.valid', true)
        ->assertJsonPath('data.cookie_days', 30);

    expect(\App\Models\AffiliateClick::count())->toBe(1);
});

it('shows the affiliate dashboard and catalogue with storefront links', function () {
    $affiliate = activeAffiliate();
    $affiliate->user->assignRole('affiliate');

    $this->actingAs($affiliate->user)->get('/affiliate/dashboard')->assertOk();
    $this->actingAs($affiliate->user)->get('/affiliate/products')->assertOk();
});
