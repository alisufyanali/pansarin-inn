<?php

use App\Http\Repositories\Admin\OrderRepository;
use App\Http\Repositories\Admin\SaleRepository;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Sale;
use Illuminate\Http\Request;

beforeEach(function () {
    \App\Models\CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    $this->customer = Customer::create(['first_name' => 'Rasool', 'last_name' => 'Bux', 'phone' => '923363222551']);
});

function orderWithItem(): Order
{
    return app(OrderRepository::class)->store([
        'customer_id' => test()->customer->id, 'shipping_charges' => 0, 'status' => 'pending', 'payment_status' => 'unpaid',
        'items' => [['custom_name' => 'Eye Dropper', 'quantity' => 1, 'price' => 100]],
    ]);
}

function saleOn(string $datetime, Order $order, string $payment = 'paid'): Sale
{
    $sale = app(SaleRepository::class)->store([
        'order_id' => $order->id, 'customer_id' => test()->customer->id,
        'delivery_status' => 'pending', 'payment_status' => $payment,
        'items' => [['custom_name' => 'Eye Dropper', 'quantity' => 1, 'price' => 100]],
    ]);
    $sale->forceFill(['created_at' => $datetime])->saveQuietly();

    return $sale;
}

it('hides orders that already have a sale, unless asked', function () {
    $open = orderWithItem();
    $done = orderWithItem();
    saleOn(now()->toDateTimeString(), $done);

    $repo = app(OrderRepository::class);
    expect($repo->getAllForDataTable(new Request())->pluck('id')->all())->toBe([$open->id])
        ->and($repo->getAllForDataTable(new Request(['with_sale' => 1]))->pluck('id')->sort()->values()->all())
        ->toBe([$open->id, $done->id]);
});

it('filters the sales list and the totals by the same date range', function () {
    $order = orderWithItem();
    saleOn('2026-10-05 23:30:00', $order);
    saleOn('2026-10-06 00:10:00', $order);
    saleOn('2026-10-06 18:00:00', $order, 'unpaid');
    saleOn('2026-10-07 09:00:00', $order);

    $repo = app(SaleRepository::class);
    $list = fn (array $q) => $repo->getAllForDataTable(new Request($q))->count();

    expect($list(['from' => '2026-10-06', 'to' => '2026-10-06']))->toBe(2)
        ->and($list(['from' => '2026-10-06']))->toBe(3)
        ->and($list([]))->toBe(4)
        ->and($repo->getStats('2026-10-06', '2026-10-06'))->toMatchArray(['total' => 2, 'pending' => 2, 'totalRevenue' => 100.0])
        ->and($repo->getStats()['total'])->toBe(4);
});
