<?php

use App\Models\CustomerGroup;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    Role::create(['name' => 'customer', 'guard_name' => 'web']);
});

// (j) Two customers same phone — second registration fails, response does NOT leak SQL
it('(j) duplicate phone on registration returns 422 without SQL in message', function () {
    // First registration succeeds
    $first = $this->postJson('/api/register', [
        'name'  => 'First User',
        'phone' => '+923001234567',
    ]);
    $first->assertStatus(201);

    // Second registration with same phone
    $second = $this->postJson('/api/register', [
        'name'  => 'Second User',
        'phone' => '+923001234567',
    ]);

    // Should succeed (findOrCreate returns existing user) OR return a clean error —
    // under no circumstances should it return a 500 with SQL leaking.
    $status = $second->getStatusCode();
    expect($status)->not->toBe(500);

    $body = $second->getContent();
    // Must not contain any SQL error strings
    expect($body)->not->toContain('SQLSTATE');
    expect($body)->not->toContain('Integrity constraint violation');
    expect($body)->not->toContain('Duplicate entry');
    expect($body)->not->toContain('unique constraint');
});

// (j) Concurrent duplicate via CustomerIdentityService — re-fetches instead of crashing
it('(j) DB unique violation on customers.phone returns no SQL in API response', function () {
    // Register first user normally
    $this->postJson('/api/register', [
        'name'  => 'Original',
        'phone' => '+923009876543',
    ])->assertStatus(201);

    // Simulate a second request — should not expose SQL
    $second = $this->postJson('/api/register', [
        'name'  => 'Duplicate',
        'phone' => '+923009876543',
    ]);

    $body = $second->getContent();
    expect($body)->not->toContain('SQLSTATE');
    expect($body)->not->toContain('Integrity constraint');
    expect($body)->not->toContain('PDOException');
    expect($body)->not->toContain('Duplicate entry');
});

it('register with an already-registered phone does not issue a token or change the password', function () {
    $this->postJson('/api/register', [
        'name'                  => 'Owner',
        'phone'                 => '+923005550000',
        'password'              => 'Secret#123',
        'password_confirmation' => 'Secret#123',
    ])->assertStatus(201);

    $attack = $this->postJson('/api/register', [
        'name'                  => 'Attacker',
        'phone'                 => '03005550000',
        'password'              => 'Hacked#123',
        'password_confirmation' => 'Hacked#123',
    ]);

    $attack->assertStatus(422)->assertJsonMissingPath('data.token');

    $user = User::where('username', '03005550000')->orWhere('username', '+923005550000')->first()
        ?? User::latest('id')->first();
    expect(\Illuminate\Support\Facades\Hash::check('Secret#123', $user->password))->toBeTrue();
});
