<?php

use App\Models\Customer;
use App\Models\CustomerGroup;
use App\Models\User;
use App\Services\CustomerLegacyImportService;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    // Never touch the real storage/app (legacy_customer_id_map.json, skip CSVs)
    $this->tmp = sys_get_temp_dir() . '/import_test_' . uniqid();
    mkdir($this->tmp . '/app', 0777, true);
    app()->useStoragePath($this->tmp);

    $this->runImport = function (array $rows): array {
        $json = $this->tmp . '/customers.json';
        file_put_contents($json, json_encode($rows));
        return app(CustomerLegacyImportService::class)->run(dryRun: false, dataPath: $json);
    };
    $this->idMap = fn () => json_decode(file_get_contents($this->tmp . '/app/legacy_customer_id_map.json'), true);
});

it('treats a DB customer stored in +92 format as duplicate of 03… input', function () {
    $existing = Customer::create(['first_name' => 'Old', 'phone' => '+92 300 1234567', 'status' => 'active']);

    $stats = ($this->runImport)([
        ['user_id' => 501, 'username' => 'Ali', 'phone' => '03001234567'],
    ]);

    expect($stats['imported'])->toBe(0)
        ->and($stats['reason']['duplicate_in_db'])->toBe(1)
        ->and(Customer::count())->toBe(1)
        ->and(($this->idMap)()['501'])->toBe($existing->id);
});

it('skips (does not crash) when a User without customer already owns the phone', function () {
    $staff = User::create(['name' => 'Staff', 'username' => '923001112222', 'password' => 'x']);

    $stats = ($this->runImport)([
        ['user_id' => 601, 'username' => 'Clash', 'phone' => '0300-111-2222'],
        ['user_id' => 602, 'username' => 'Fine',  'phone' => '03009998888'],
    ]);

    expect($stats['reason']['phone_taken_by_user'])->toBe(1)
        ->and($stats['imported'])->toBe(1)                        // run continued
        ->and(User::where('username', '923001112222')->count())->toBe(1)
        ->and(($this->idMap)())->not->toHaveKey('601')            // no customer to map to
        ->and(($this->idMap)())->toHaveKey('602');
});

it('maps to the existing customer when the owning User has one', function () {
    $u = User::create(['name' => 'Has Cust', 'username' => 'someone', 'phone' => '923004445555', 'password' => 'x']);
    $c = Customer::create(['user_id' => $u->id, 'first_name' => 'Has', 'phone' => null, 'status' => 'active']);

    ($this->runImport)([['user_id' => 701, 'username' => 'X', 'phone' => '03004445555']]);

    expect(($this->idMap)()['701'])->toBe($c->id);
});

it('skips when a User already owns the email', function () {
    User::create(['name' => 'E', 'username' => 'e1', 'email' => 'taken@example.com', 'password' => 'x']);

    $stats = ($this->runImport)([
        ['user_id' => 801, 'username' => 'Y', 'phone' => '03007776666', 'email' => 'TAKEN@example.com'],
    ]);

    expect($stats['reason']['email_taken_by_user'])->toBe(1)
        ->and($stats['imported'])->toBe(0);
});

it('imports a clean row with user, wallet, loyalty and forced password change', function () {
    $stats = ($this->runImport)([['user_id' => 901, 'username' => 'Sara', 'phone' => '3001231234']]);

    $c = Customer::where('phone', '923001231234')->firstOrFail();
    expect($stats['imported'])->toBe(1)
        ->and($c->user->must_change_password)->toBeTrue()
        ->and($c->wallet)->not->toBeNull()
        ->and($c->loyaltyPoints)->not->toBeNull()
        ->and($c->customer_group_id)->toBe(CustomerGroup::where('is_default', true)->value('id'));
});

it('dry-run reports DB duplicates without writing anything', function () {
    Customer::create(['first_name' => 'Old', 'phone' => '923001234567', 'status' => 'active']);
    $json = $this->tmp . '/customers.json';
    file_put_contents($json, json_encode([['user_id' => 1, 'username' => 'A', 'phone' => '03001234567']]));

    $stats = app(CustomerLegacyImportService::class)->run(dryRun: true, dataPath: $json);

    expect($stats['reason']['duplicate_in_db'])->toBe(1)
        ->and(User::count())->toBe(0)
        ->and(file_exists($this->tmp . '/app/legacy_customer_id_map.json'))->toBeFalse();
});
