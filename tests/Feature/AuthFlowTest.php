<?php

use App\Models\CustomerGroup;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    Role::firstOrCreate(['name' => 'admin',    'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
});

// ── (h) Admin login with email ─────────────────────────────────
it('(h) admin web login succeeds with email', function () {
    $admin = User::create([
        'name'     => 'Super Admin',
        'username' => 'superadmin',
        'email'    => 'admin@pansariinn.com',
        'phone'    => '923001000001',
        'password' => bcrypt('Admin@12345'),
        'status'   => 1,
    ]);
    $admin->assignRole('admin');

    // Fortify login endpoint — web session
    $response = $this->post('/login', [
        'email'    => 'admin@pansariinn.com',
        'password' => 'Admin@12345',
    ]);

    // Should redirect (302) to admin.dashboard, not stay on login with errors
    $response->assertRedirect();
    expect($response->getTargetUrl())->not->toContain('/login');
});

// ── (h) Admin login with username ─────────────────────────────
it('(h) admin web login succeeds with username superadmin', function () {
    $admin = User::create([
        'name'     => 'Super Admin',
        'username' => 'superadmin',
        'email'    => 'admin2@pansariinn.com',
        'phone'    => '923001000002',
        'password' => bcrypt('Admin@12345'),
        'status'   => 1,
    ]);
    $admin->assignRole('admin');

    $response = $this->post('/login', [
        'email'    => 'superadmin',   // Fortify 'email' field accepts username too
        'password' => 'Admin@12345',
    ]);

    $response->assertRedirect();
    expect($response->getTargetUrl())->not->toContain('/login');
});

// ── (h) Customer API login by phone ───────────────────────────
it('(h) customer API login by phone returns token + must_change_password', function () {
    $user = User::create([
        'name'                 => 'Customer Phone',
        'username'             => '923005556666',
        'email'                => null,
        'phone'                => '923005556666',
        'password'             => bcrypt('923005556666'),
        'status'               => 1,
        'must_change_password' => true,
    ]);
    $user->assignRole('customer');

    $response = $this->postJson('/api/login', [
        'phone'    => '+923005556666',
        'password' => '923005556666',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.must_change_password', true)
        ->assertJsonStructure(['data' => ['token', 'must_change_password', 'user']]);
});

// ── (h) must_change_password=true → other endpoints return 403 ─
it('(h) must_change_password=true blocks /api/orders but allows /api/change-password', function () {
    $user = User::create([
        'name'                 => 'Forced Change',
        'username'             => '923007778888',
        'email'                => null,
        'phone'                => '923007778888',
        'password'             => bcrypt('923007778888'),
        'status'               => 1,
        'must_change_password' => true,
    ]);
    $user->assignRole('customer');

    // Authenticate
    $token = $user->createToken('api-token')->plainTextToken;
    $headers = ['Authorization' => "Bearer {$token}"];

    // Blocked endpoint
    $blocked = $this->getJson('/api/orders', $headers);
    $blocked->assertStatus(403)
        ->assertJsonPath('must_change_password', true)
        ->assertJsonPath('message', 'Password change required');

    // Allowed: change-password endpoint itself
    $allowed = $this->postJson('/api/change-password', [
        'current_password'      => '923007778888',
        'password'              => 'NewPass@9999',
        'password_confirmation' => 'NewPass@9999',
    ], $headers);

    // Should NOT return 403 (may be 422 due to password rules in test, but not 403)
    expect($allowed->getStatusCode())->not->toBe(403);

    // Allowed: logout
    $logout = $this->postJson('/api/logout', [], $headers);
    expect($logout->getStatusCode())->not->toBe(403);
});

// ── (h) must_change_password=false → orders endpoint is accessible
it('(h) must_change_password=false allows /api/user', function () {
    $user = User::create([
        'name'                 => 'Normal User',
        'username'             => '923009990000',
        'email'                => null,
        'phone'                => '923009990000',
        'password'             => bcrypt('923009990000'),
        'status'               => 1,
        'must_change_password' => false,
    ]);
    $user->assignRole('customer');

    $token = $user->createToken('api-token')->plainTextToken;

    $response = $this->getJson('/api/user', ['Authorization' => "Bearer {$token}"]);
    $response->assertStatus(200)->assertJsonPath('success', true);
});
