<?php

use App\Models\CustomerGroup;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    CustomerGroup::firstOrCreate(
        ['name' => 'General'],
        ['discount_percentage' => 0, 'is_default' => true]
    );
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));
    $response->assertStatus(200);
});

test('new users can register via API with phone', function () {
    $response = $this->postJson('/api/register', [
        'name'     => 'Test User',
        'phone'    => '+923001234567',
        'email'    => 'testuser@gmail.com',
        'password' => 'Test@12345',
        'password_confirmation' => 'Test@12345',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'phone']]]);
});

test('registration fails without phone', function () {
    $response = $this->postJson('/api/register', [
        'name'  => 'No Phone',
        'email' => 'noPhone@gmail.com',
    ]);

    $response->assertStatus(422);
});

test('registration fails with invalid Pakistani phone', function () {
    $response = $this->postJson('/api/register', [
        'name'  => 'Bad Phone',
        'phone' => '+14155552671',  // US number
    ]);

    // 422 validation OK, or 422 from normalize() check
    $response->assertStatus(422);
});
