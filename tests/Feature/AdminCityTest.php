<?php

use App\Models\City;
use App\Models\State;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['create.cities', 'edit.cities', 'view.cities'] as $p) {
        Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
    }
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web'])
        ->givePermissionTo(['create.cities', 'edit.cities', 'view.cities']);
    $this->admin = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => bcrypt('secret')]);
    $this->admin->forceFill(['email_verified_at' => now()])->save();
    $this->admin->assignRole('admin');
});

it('adds a new city from the admin form (state filled from the province)', function () {
    $this->actingAs($this->admin)
        ->post('/admin/cities', ['name' => 'Mastung', 'shipping_charges' => 300, 'province' => 'balochistan'])
        ->assertRedirect(route('admin.cities.index'))
        ->assertSessionHas('success');

    $city = City::where('name', 'Mastung')->firstOrFail();
    expect($city->province)->toBe('balochistan')
        ->and(State::find($city->state_id)->name)->toBe('Balochistan');
});

it('moves the city to the new state when its province is changed', function () {
    $this->actingAs($this->admin)
        ->post('/admin/cities', ['name' => 'Mastung', 'shipping_charges' => 300, 'province' => 'sindh']);
    $city = City::where('name', 'Mastung')->firstOrFail();

    $this->actingAs($this->admin)
        ->put("/admin/cities/{$city->id}", ['name' => 'Mastung', 'shipping_charges' => 350, 'province' => 'balochistan'])
        ->assertRedirect(route('admin.cities.index'));

    $city->refresh();
    expect(State::find($city->state_id)->name)->toBe('Balochistan')
        ->and((float) $city->shipping_charges)->toBe(350.0);
});
