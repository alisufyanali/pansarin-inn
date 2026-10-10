<?php

use App\Models\City;
use App\Models\CourierBooking;
use App\Models\Customer;
use App\Models\Order;
use App\Services\CourierService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

// Couriers are always faked here — tests never book a real parcel.
beforeEach(function () {
    \App\Models\CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);
    config(['services.leopard.api_key' => 'k', 'services.leopard.api_password' => 'p', 'services.postex.api_token' => 't']);

    $this->customer = Customer::create(['first_name' => 'Rasool', 'last_name' => 'Bux', 'phone' => '923363222551']);
    $country = \App\Models\Country::create(['name' => 'Pakistan', 'code' => 'PK']);
    $this->stateId = \App\Models\State::create(['name' => 'Punjab', 'country_id' => $country->id])->id;

    $this->order = function (string $method, string $cityName) {
        $city = City::forceCreate(['name' => $cityName, 'state_id' => $this->stateId, 'province' => 'punjab', 'shipping_charges' => 250]);

        return Order::create([
            'customer_id' => $this->customer->id, 'city_id' => $city->id, 'shipping_method' => $method,
            'customer_name' => 'Rasool Bux', 'customer_phone' => '923363222551',
            'shipping_address' => 'House 123, Street 4', 'status' => 'processing', 'payment_status' => 'unpaid',
            'grand_total' => 1050, 'courier_weight' => '1',
        ]);
    };
});

function fakeLeopards(array $bookAnswer): void
{
    Http::fake([
        '*/getAllCities/*' => Http::response(['status' => 1, 'error' => 0, 'city_list' => [
            ['id' => 592, 'name' => 'Karachi', 'allow_as_destination' => true],
            ['id' => 789, 'name' => 'Lahore', 'allow_as_destination' => true],
            ['id' => 486, 'name' => 'Islamabad', 'allow_as_destination' => true],
        ]]),
        '*/bookPacket/*' => Http::response($bookAnswer),
    ]);
}

it('books Leopards with the real city id from the Leopards list and saves the tracking number', function () {
    fakeLeopards(['status' => 1, 'error' => 0, 'track_number' => 'KI7512345678', 'slip_link' => 'https://x/slip']);
    $order = ($this->order)('leopard', 'Lahore');

    $booking = app(CourierService::class)->book($order);

    expect($booking->status)->toBe('booked')
        ->and($booking->tracking_number)->toBe('KI7512345678')
        ->and($booking->destination_city)->toBe('Lahore')
        ->and($booking->response['slip_link'])->toBe('https://x/slip')
        ->and($order->fresh()->shipping_response)->toBe('KI7512345678');

    Http::assertSent(fn (Request $r) => str_contains($r->url(), 'bookPacket')
        && $r['destination_city'] === 789          // Lahore, not the old hard-coded 593
        && $r['booked_packet_weight'] === 1000);   // grams
});

it('never sends a parcel to the wrong city: an unknown city fails the booking without calling bookPacket', function () {
    fakeLeopards(['status' => 1, 'error' => 0, 'track_number' => 'X']);
    $order = ($this->order)('leopard', 'Gujranwala');

    $booking = app(CourierService::class)->book($order);

    expect($booking->status)->toBe('failed')
        ->and($booking->message)->toContain('Gujranwala')
        ->and($order->fresh()->shipping_response)->toBeNull();
    Http::assertNotSent(fn (Request $r) => str_contains($r->url(), 'bookPacket'));
});

it('records a Leopards rejection with its message and full answer', function () {
    fakeLeopards(['status' => 0, 'error' => 'Invalid consignee phone number']);
    $order = ($this->order)('leopard', 'Karachi');

    $booking = app(CourierService::class)->book($order);

    expect($booking->status)->toBe('failed')
        ->and($booking->message)->toBe('Leopards: Invalid consignee phone number')
        ->and($booking->response['error'])->toBe('Invalid consignee phone number')
        ->and($booking->request)->not->toHaveKeys(['api_key', 'api_password']); // credentials never stored
});

it('books PostEx with the PostEx spelling of the city and a local phone number', function () {
    Http::fake([
        '*/get-operational-city' => Http::response(['statusCode' => '200', 'dist' => [
            ['operationalCityName' => 'NAWABSHAH', 'isDeliveryCity' => true],
            ['operationalCityName' => 'TANDO MUHAMMAD KHAN', 'isDeliveryCity' => true],
        ]]),
        '*/v3/create-order' => Http::response(['statusCode' => '200', 'statusMessage' => 'ORDER HAS BEEN CREATED',
            'dist' => ['trackingNumber' => '22420123456789', 'orderStatus' => 'Unbooked']]),
    ]);

    $first  = app(CourierService::class)->book(($this->order)('px', 'Nawab Shah'));
    $second = app(CourierService::class)->book(($this->order)('px', 'Tando Mohd. Khan'));

    expect($first->tracking_number)->toBe('22420123456789')
        ->and($first->destination_city)->toBe('NAWABSHAH')
        ->and($second->destination_city)->toBe('TANDO MUHAMMAD KHAN');

    Http::assertSent(fn (Request $r) => str_contains($r->url(), 'create-order')
        && $r['cityName'] === 'NAWABSHAH' && $r['customerPhone'] === '03363222551');
});

it('does not book couriers without an API (TCS, rider…)', function () {
    Http::fake();
    expect(app(CourierService::class)->book(($this->order)('tcs', 'Karachi')))->toBeNull()
        ->and(CourierBooking::count())->toBe(0);
    Http::assertNothingSent();
});

it('keeps a failed attempt when the courier cannot be reached', function () {
    Http::fake(fn () => throw new \Illuminate\Http\Client\ConnectionException('timed out'));
    $booking = app(CourierService::class)->book(($this->order)('leopard', 'Karachi'));

    expect($booking->status)->toBe('failed')
        ->and($booking->message)->toContain('timed out');
});

it('retries from the sale page after the city is fixed, and never books the same order twice', function () {
    fakeLeopards(['status' => 1, 'error' => 0, 'track_number' => 'KI7500000001']);
    \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'edit.sales', 'guard_name' => 'web']);
    $role  = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $role->givePermissionTo('edit.sales');
    $admin = \App\Models\User::create(['name' => 'Admin', 'email' => 'a@example.com', 'password' => bcrypt('secret')]);
    $admin->forceFill(['email_verified_at' => now()])->save();
    $admin->assignRole('admin');

    $order = ($this->order)('leopard', 'Gujranwala');
    $sale  = \App\Models\Sale::create([
        'order_id' => $order->id, 'customer_id' => $this->customer->id, 'city_id' => $order->city_id,
        'shipping_method' => 'leopard', 'delivery_status' => 'pending', 'payment_status' => 'unpaid', 'grand_total' => 1050,
    ]);

    // 1st try: Leopards does not know the city — failed attempt recorded
    $this->actingAs($admin)->post("/admin/sales/{$sale->id}/book-courier")->assertSessionHas('error');
    expect(CourierBooking::where('status', 'failed')->count())->toBe(1);

    // Admin picks a city Leopards knows, then retries
    $lahore = City::forceCreate(['name' => 'Lahore', 'state_id' => $this->stateId, 'province' => 'punjab', 'shipping_charges' => 250]);
    $sale->update(['city_id' => $lahore->id]);
    $this->actingAs($admin)->post("/admin/sales/{$sale->id}/book-courier")->assertSessionHas('success');
    expect($order->fresh()->shipping_response)->toBe('KI7500000001')
        ->and($sale->fresh()->shipping_response)->toBe('KI7500000001');

    // Pressing it again does not book a second parcel
    $this->actingAs($admin)->post("/admin/sales/{$sale->id}/book-courier")->assertSessionHas('error');
    // City list fetched once (then cached) and exactly one bookPacket call
    Http::assertSentCount(2);
    expect(collect(Http::recorded())->filter(fn ($r) => str_contains($r[0]->url(), 'bookPacket'))->count())->toBe(1);
});
