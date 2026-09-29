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

it('refuses web login for a deactivated account', function () {
    User::create([
        'name' => 'Blocked Staff', 'username' => 'blockedstaff', 'email' => 'blocked@example.com',
        'password' => bcrypt('Secret#123'), 'status' => 0,
    ]);

    $this->post('/login', ['email' => 'blocked@example.com', 'password' => 'Secret#123']);

    $this->assertGuest();
});
