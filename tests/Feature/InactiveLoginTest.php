<?php

use App\Models\CustomerGroup;
use App\Models\User;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
});

it('refuses API login for a deactivated account', function () {
    User::create([
        'name' => 'Blocked', 'username' => '923005557777', 'phone' => '923005557777',
        'password' => bcrypt('Secret#123'), 'status' => 0,
    ]);

    $this->postJson('/api/login', ['phone' => '03005557777', 'password' => 'Secret#123'])
        ->assertStatus(403)
        ->assertJsonMissingPath('data.token');
});

it('signs a user out of the API when the account is deactivated', function () {
    $user = User::create([
        'name' => 'Active', 'username' => '923005558888', 'phone' => '923005558888',
        'password' => bcrypt('Secret#123'), 'status' => 1,
    ]);
    $user->createToken('api-token');
    $user->createToken('api-token');

    $user->update(['status' => 0]);

    expect($user->tokens()->count())->toBe(0);
});

it('refuses web login for a deactivated account', function () {
    User::create([
        'name' => 'Blocked Staff', 'username' => 'blockedstaff', 'email' => 'blocked@example.com',
        'password' => bcrypt('Secret#123'), 'status' => 0,
    ]);

    $this->post('/login', ['email' => 'blocked@example.com', 'password' => 'Secret#123']);

    $this->assertGuest();
});
