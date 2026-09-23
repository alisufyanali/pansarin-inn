<?php

use App\Models\Customer;
use App\Models\CustomerGroup;
use App\Models\LoyaltyPointTransaction;

beforeEach(function () {
    CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    $this->customer = Customer::create([
        'first_name' => 'Sara',
        'last_name'  => 'Khan',
        'phone'      => '923002222222',
        'email'      => 'sara@gmail.com',
        'address'    => '456 Test Ave, Lahore',
        'status'     => 'active',
        'customer_group_id' => CustomerGroup::where('is_default', true)->first()->id,
    ]);

    $this->customer2 = Customer::create([
        'first_name' => 'Bilal',
        'last_name'  => 'Ahmed',
        'phone'      => '923003333333',
        'email'      => 'bilal@gmail.com',
        'address'    => '789 Test Rd, Islamabad',
        'status'     => 'active',
        'customer_group_id' => CustomerGroup::where('is_default', true)->first()->id,
    ]);
});

it('creates LoyaltyPointTransaction records and associates via customer relation', function () {
    $txn1 = LoyaltyPointTransaction::create([
        'customer_id' => $this->customer->id,
        'points'      => 100,
        'type'        => 'earned',
        'reason'      => 'signup_bonus',
        'reference'   => null,
    ]);

    $txn2 = LoyaltyPointTransaction::create([
        'customer_id' => $this->customer->id,
        'points'      => 50,
        'type'        => 'earned',
        'reason'      => 'purchase',
        'reference'   => 'ORD-2026-0001',
    ]);

    $txn3 = LoyaltyPointTransaction::create([
        'customer_id' => $this->customer->id,
        'points'      => -30,
        'type'        => 'redeemed',
        'reason'      => 'discount',
        'reference'   => 'ORD-2026-0002',
    ]);

    LoyaltyPointTransaction::create([
        'customer_id' => $this->customer2->id,
        'points'      => 75,
        'type'        => 'earned',
        'reason'      => 'purchase',
        'reference'   => 'ORD-2026-0003',
    ]);

    expect($txn1->id)->not->toBeNull();
    expect($txn2->id)->not->toBeNull();
    expect($txn3->id)->not->toBeNull();
});

it('loads 3 loyalty transactions for customer1 via $customer->loyaltyTransactions relation', function () {
    LoyaltyPointTransaction::create([
        'customer_id' => $this->customer->id,
        'points'      => 100,
        'type'        => 'earned',
        'reason'      => 'signup_bonus',
        'reference'   => null,
    ]);
    LoyaltyPointTransaction::create([
        'customer_id' => $this->customer->id,
        'points'      => 50,
        'type'        => 'earned',
        'reason'      => 'purchase',
        'reference'   => 'ORD-2026-0001',
    ]);
    LoyaltyPointTransaction::create([
        'customer_id' => $this->customer->id,
        'points'      => -30,
        'type'        => 'redeemed',
        'reason'      => 'discount',
        'reference'   => 'ORD-2026-0002',
    ]);
    LoyaltyPointTransaction::create([
        'customer_id' => $this->customer2->id,
        'points'      => 75,
        'type'        => 'earned',
        'reason'      => 'purchase',
        'reference'   => 'ORD-2026-0003',
    ]);

    $loaded = $this->customer->loyaltyTransactions;
    expect($loaded)->toHaveCount(3);

    $points = $loaded->pluck('points')->sort()->values()->all();
    expect($points)->toBe([-30, 50, 100]);

    $reasons = $loaded->pluck('reason')->sort()->values()->all();
    expect($reasons)->toBe(['discount', 'purchase', 'signup_bonus']);

    $types = $loaded->pluck('type')->unique()->values()->sort()->all();
    expect($types)->toBe(['earned', 'redeemed']);
});

it('casts points field to integer and type default works on create', function () {
    $txn = LoyaltyPointTransaction::create([
        'customer_id' => $this->customer->id,
        'points'      => '25',
        'reason'      => 'referral',
        'reference'   => 'REF-001',
    ]);

    expect($txn->points)->toBe(25);
    expect(is_int($txn->points))->toBeTrue();
    expect($txn->type)->toBe('earned');
    expect($txn->reference)->toBe('REF-001');
});

it('belongsTo customer relation works from transaction side', function () {
    $txn = LoyaltyPointTransaction::create([
        'customer_id' => $this->customer->id,
        'points'      => 200,
        'type'        => 'admin_adjustment',
        'reason'      => 'manual credit',
        'reference'   => 'ADJ-2026-001',
    ]);

    $related = $txn->customer;
    expect($related)->not->toBeNull();
    expect($related->id)->toBe($this->customer->id);
    expect($related->full_name)->toBe('Sara Khan');
    expect($related->phone)->toBe('923002222222');
});

it('customer2 has only its own transactions (isolation via customer_id FK)', function () {
    LoyaltyPointTransaction::create([
        'customer_id' => $this->customer->id,
        'points'      => 100,
        'type'        => 'earned',
        'reason'      => 'signup_bonus',
    ]);
    LoyaltyPointTransaction::create([
        'customer_id' => $this->customer2->id,
        'points'      => 75,
        'type'        => 'earned',
        'reason'      => 'purchase',
    ]);
    LoyaltyPointTransaction::create([
        'customer_id' => $this->customer2->id,
        'points'      => -15,
        'type'        => 'redeemed',
        'reason'      => 'gift_card',
    ]);

    expect($this->customer->loyaltyTransactions)->toHaveCount(1);
    expect($this->customer2->loyaltyTransactions)->toHaveCount(2);

    $firstCustTxn = $this->customer->loyaltyTransactions->first();
    expect($firstCustTxn->points)->toBe(100);
    expect($firstCustTxn->reason)->toBe('signup_bonus');
});
