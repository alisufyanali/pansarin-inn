<?php

use App\Helpers\PhoneHelper;
use App\Models\CustomerGroup;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    Role::create(['name' => 'customer', 'guard_name' => 'web']);
});

it('changing the phone moves the login and the customer record with it', function () {
    [$user, $customer] = app(\App\Services\CustomerIdentityService::class)
        ->findOrCreateByPhone(PhoneHelper::normalize('03001111111'), ['first_name' => 'Ali']);
    $user->update(['must_change_password' => false]);

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/profile', ['phone' => '0300 2222222'])
        ->assertOk();

    $new = PhoneHelper::normalize('03002222222');
    expect($user->fresh()->username)->toBe($new)
        ->and($user->fresh()->phone)->toBe($new)
        ->and($customer->fresh()->phone)->toBe($new);
});

it('rejects a phone that belongs to another customer', function () {
    $identity = app(\App\Services\CustomerIdentityService::class);
    [$user] = $identity->findOrCreateByPhone(PhoneHelper::normalize('03001111111'), ['first_name' => 'Ali']);
    $identity->findOrCreateByPhone(PhoneHelper::normalize('03003333333'), ['first_name' => 'Other']);
    $user->update(['must_change_password' => false]);

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/profile', ['phone' => '03003333333'])
        ->assertStatus(422);
});
