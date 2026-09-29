<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    config(['app.frontend_url' => 'https://pansariinn.com']);
    $this->customer = User::factory()->create(['email' => 'ali@example.com', 'must_change_password' => true]);
    $this->customer->assignRole(Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']));
});

it('emails a reset link that opens the storefront reset page', function () {
    Notification::fake();

    $this->postJson('/api/forgot-password', ['email' => 'ALI@example.com'])
        ->assertOk()
        ->assertJsonPath('success', true);

    Notification::assertSentTo($this->customer, ResetPassword::class, function (ResetPassword $n) {
        $url = $n->toMail($this->customer)->actionUrl;

        return str_starts_with($url, 'https://pansariinn.com/reset-password?token=')
            && str_contains($url, 'email=ali%40example.com');
    });
});

it('answers the same for an unknown email and sends nothing', function () {
    Notification::fake();

    $this->postJson('/api/forgot-password', ['email' => 'nobody@example.com'])
        ->assertOk()
        ->assertJsonPath('success', true);

    Notification::assertNothingSent();
});

it('sends staff to the admin reset page', function () {
    Notification::fake();
    $staff = User::factory()->create(['email' => 'staff@example.com']);
    $staff->assignRole(Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']));

    $this->postJson('/api/forgot-password', ['email' => 'staff@example.com'])->assertOk();

    Notification::assertSentTo($staff, ResetPassword::class, function (ResetPassword $n) use ($staff) {
        return str_contains($n->toMail($staff)->actionUrl, '/reset-password/');
    });
});

it('resets the password, clears the forced change and signs out old tokens', function () {
    $this->customer->createToken('api-token');
    $token = Password::broker()->createToken($this->customer);

    $this->postJson('/api/reset-password', [
        'token' => $token, 'email' => 'ali@example.com',
        'password' => 'NewSecret#123', 'password_confirmation' => 'NewSecret#123',
    ])->assertOk()->assertJsonPath('success', true);

    $user = $this->customer->fresh();
    expect(Hash::check('NewSecret#123', $user->password))->toBeTrue()
        ->and($user->must_change_password)->toBeFalse()
        ->and($user->tokens()->count())->toBe(0);
});

it('rejects an invalid token and a weak password', function () {
    $this->postJson('/api/reset-password', [
        'token' => 'wrong', 'email' => 'ali@example.com',
        'password' => 'NewSecret#123', 'password_confirmation' => 'NewSecret#123',
    ])->assertStatus(422)->assertJsonPath('success', false);

    $token = Password::broker()->createToken($this->customer);
    $this->postJson('/api/reset-password', [
        'token' => $token, 'email' => 'ali@example.com',
        'password' => 'weak', 'password_confirmation' => 'weak',
    ])->assertStatus(422)->assertJsonValidationErrors('password');
});
