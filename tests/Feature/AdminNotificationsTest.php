<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

/** One user per role; returns them keyed by role */
function staffByRole(): array
{
    $users = [];
    foreach (['super-admin', 'admin', 'manager', 'customer'] as $i => $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        $users[$role] = User::create([
            'name' => $role, 'email' => "{$role}{$i}@example.com", 'password' => bcrypt('secret'),
        ]);
        $users[$role]->forceFill(['email_verified_at' => now()])->save(); // admin routes need a verified email
        $users[$role]->assignRole($role);
    }
    return $users;
}

it('notifies super-admins and admins, not other roles', function () {
    $users = staffByRole();

    expect(User::notifiableStaff()->pluck('id')->sort()->values()->all())
        ->toBe(collect([$users['super-admin']->id, $users['admin']->id])->sort()->values()->all());
});

it('rings the bell for a new contact message, the owner included', function () {
    $users = staffByRole();

    $this->postJson('/api/contact', [
        'name' => 'Ali', 'email' => 'ali@example.com', 'subject' => 'Price', 'message' => 'Hello',
    ])->assertSuccessful();

    expect($users['super-admin']->unreadNotifications()->count())->toBe(1)
        ->and($users['admin']->unreadNotifications()->count())->toBe(1)
        ->and($users['manager']->unreadNotifications()->count())->toBe(0);
});

it('rings the bell for a new newsletter subscriber', function () {
    $users = staffByRole();

    $this->postJson('/api/newsletter/subscribe', ['email' => 'reader@example.com'])->assertSuccessful();

    expect($users['super-admin']->unreadNotifications()->count())->toBe(1);
});

it('rings the bell once for an incoming WhatsApp message, not for Meta retries', function () {
    config(['services.whatsapp.app_secret' => null]);
    $users = staffByRole();
    $payload = ['entry' => [['changes' => [['value' => [
        'contacts' => [['wa_id' => '923001112233', 'profile' => ['name' => 'Ali']]],
        'messages' => [['from' => '923001112233', 'id' => 'wamid.bell1', 'type' => 'text', 'text' => ['body' => 'Is Alsi in stock?']]],
    ]]]]]];

    $this->postJson('/whatsapp/webhook', $payload)->assertOk();
    $this->postJson('/whatsapp/webhook', $payload)->assertOk(); // Meta retry

    $notes = $users['super-admin']->unreadNotifications()->get();
    expect($notes)->toHaveCount(1)
        ->and($notes->first()->data['message'])->toContain('Ali')->toContain('Is Alsi in stock?')
        ->and($notes->first()->data['action_url'])->toBe('/admin/whatsapp/chat');
});

it('serves the latest unread notifications to the bell', function () {
    $users = staffByRole();
    // The seeder gives super-admin every permission; the bell endpoint needs this one
    \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'view.notifications', 'guard_name' => 'web']);
    Role::findByName('super-admin')->givePermissionTo('view.notifications');
    $this->postJson('/api/newsletter/subscribe', ['email' => 'a@example.com'])->assertSuccessful();

    $this->actingAs($users['super-admin'])
        ->getJson('/admin/notifications/unread')
        ->assertOk()
        ->assertJsonPath('count', 1)
        ->assertJsonCount(1, 'notifications');
});
