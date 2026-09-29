<?php

use App\Models\Affiliate;
use App\Models\User;

it('keeps the affiliate wallet in step with commission earned', function () {
    $user      = User::factory()->create();
    $affiliate = Affiliate::create([
        'user_id' => $user->id, 'affiliate_code' => 'AFF1', 'commission_rate' => 10, 'status' => 'active',
    ]);

    $affiliate->increment('balance', 150);

    expect((float) $affiliate->wallet()->first()->balance)->toBe(150.0);
});

it('affiliate customer registration creates a phone-login customer with a profile', function () {
    \App\Models\CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::create(['name' => 'customer', 'guard_name' => 'web']);
    $referrer = User::factory()->create();
    Affiliate::create(['user_id' => $referrer->id, 'affiliate_code' => 'AFF2', 'status' => 'active']);

    $this->post(route('affiliate.customer.store'), [
        'name' => 'Sara Khan', 'email' => 'sara@example.com', 'phone' => '0300 1234567',
        'password' => 'Secret#123', 'password_confirmation' => 'Secret#123', 'affiliate_code' => 'AFF2',
    ])->assertRedirect(route('login'));

    $user = User::where('email', 'sara@example.com')->sole();
    expect($user->username)->toBe(\App\Helpers\PhoneHelper::normalize('03001234567'))
        ->and($user->referred_by)->toBe($referrer->id)
        ->and($user->customer)->not->toBeNull();
});
