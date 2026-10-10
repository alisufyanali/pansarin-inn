<?php

namespace App\Services;

use App\Models\CourierBooking;
use App\Models\Order;
use App\Models\Sale;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Books a parcel with the order's courier (Leopards, PostEx or Movex) and
 * records every attempt in courier_bookings — booked or failed, with the
 * courier's full answer. The destination city is looked up in the courier's
 * own city list by name; a city the courier does not know stops the booking
 * with a clear message instead of sending the parcel somewhere else.
 */
class CourierService
{
    private const TIMEOUT = 30;          // seconds per courier call
    private const CITY_CACHE_TTL = 86400; // courier city lists change rarely

    private const LEOPARD_BASE = 'https://merchantapi.leopardscourier.com/api';
    private const POSTEX_BASE  = 'https://api.postex.pk/services/integration/api/order';
    private const MOVEX_BASE   = 'https://tracking.movexpk.com/api';

    /**
     * Same city, other spellings (after normalizeCity). Only needed where
     * spaces / dots alone do not explain the difference.
     */
    private const CITY_ALIASES = [
        'tandoalayar'   => ['tandoallahyar'],
        'tandoallahyar' => ['tandoalayar'],
        'nowsheroferoz' => ['naushahroferoze', 'nausharoferoz'],
        'naushahroferoze' => ['nowsheroferoz', 'nausharoferoz'],
        'qamber'        => ['kamber', 'kambar', 'qambar'],
        'kamberalikhan' => ['kamber', 'qamber'],
        'sehwan'        => ['sehwansharif'],
        'sehwansharif'  => ['sehwan'],
        'dikhan'        => ['deraismailkhan'],
        'deraismailkhan' => ['dikhan'],
        'dgkhan'        => ['deraghazikhan'],
        'deraghazikhan' => ['dgkhan'],
        'rahimyarkhan'  => ['ryk'],
        'azadjammuandkashmir' => ['muzaffarabad'],
        // Checked against the Leopards / PostEx city lists (2026-10-10)
        'gwadar'        => ['gawadar'],
        'sibbi'         => ['sibi'],
        'kamoki'        => ['kamoke'],
        'swat'          => ['mingora', 'saidusharif'],
        'sajawal'       => ['sujawal'],
        'sujawal'       => ['sajawal'],
        'qaziahmed'     => ['qaziahmad'],
        'meher'         => ['mehar'],
        'ratodearo'     => ['ratodero'],
        'jhudo'         => ['jhuddo'],
        'killasaifullah' => ['qilasaifullah'],
        'qalat'         => ['kalat'],
        'kalat'         => ['qalat'],
    ];

    /** Couriers with an API integration; everything else is arranged by hand. */
    public static function supports(?string $method): bool
    {
        return isset(CourierBooking::API_COURIERS[$method ?? '']);
    }

    /**
     * Book the order with its shipping_method and record the attempt.
     * Null when the courier has no API (TCS, Trax, rider…) — nothing to book.
     */
    public function book(Order $order, ?Sale $sale = null): ?CourierBooking
    {
        $method = $order->shipping_method;
        if (! self::supports($method)) {
            return null;
        }

        $order->loadMissing(['customer', 'items', 'city']);
        $sale?->loadMissing('city');

        // The sale's details win: it is what the admin confirmed for dispatch
        $shipment = [
            'name'    => $order->customer_name ?: $order->customer?->full_name,
            'phone'   => $order->customer_phone ?: $order->customer?->phone,
            'email'   => $order->customer_email ?: ($order->customer?->email ?? ''),
            'address' => trim((string) ($sale?->shipping_address ?: $order->shipping_address)),
            'city'    => $sale?->city?->name ?? $order->city?->name ?? '',
            'amount'  => round((float) ($sale?->grand_total ?: $order->grand_total)),
            'weight'  => (float) ($order->courier_weight ?: 0.5),
            'pieces'  => max(1, $order->items->count()),
            'details' => $order->items->map(fn ($i) => $i->meta['product_name'] ?? null)->filter()->join(', ') ?: 'Herbal Products',
        ];

        $record = [
            'order_id' => $order->id,
            'sale_id'  => $sale?->id,
            'courier'  => $method,
            'user_id'  => auth()->id(),
        ];

        try {
            $result = match ($method) {
                'leopard' => $this->bookLeopard($order, $shipment),
                'px'      => $this->bookPostEx($order, $shipment),
                'movex'   => $this->bookMovex($order, $shipment),
            };
        } catch (CourierBookingFailed $e) {
            $result = $e->result;
        } catch (\Throwable $e) {
            $result = ['status' => 'failed', 'message' => 'Could not reach the courier: ' . $e->getMessage()];
        }

        $booking = CourierBooking::create($record + $result);

        if ($booking->isBooked()) {
            $order->update(['shipping_response' => $booking->tracking_number]);
            $sale?->update(['shipping_response' => $booking->tracking_number]);
            Log::info("Courier booked [{$method}]", ['order' => $order->order_number, 'tracking' => $booking->tracking_number]);
        } else {
            Log::warning("Courier booking failed [{$method}]", ['order' => $order->order_number, 'message' => $booking->message]);
        }

        return $booking;
    }

    // ── Leopards ──────────────────────────────────────────────────

    private function bookLeopard(Order $order, array $s): array
    {
        $city = $this->findCity($this->leopardCities(), $s['city'], 'Leopards');

        $payload = [
            'booked_packet_weight'         => (int) round($s['weight'] * 1000), // grams
            'booked_packet_no_piece'       => $s['pieces'],
            'booked_packet_collect_amount' => $s['amount'],
            'booked_packet_order_id'       => $order->order_number,
            'origin_city'                  => (int) config('services.leopard.origin_city', 592),
            'destination_city'             => (int) $city['id'],
            'shipment_id'                  => config('services.leopard.shipment_id'),
            'shipment_name_eng'            => 'Self',
            'shipment_email'               => config('services.leopard.shipment_email'),
            'shipment_phone'               => config('services.leopard.shipment_phone'),
            'shipment_address'             => config('services.leopard.shipment_address'),
            'consignment_name_eng'         => $s['name'],
            'consignment_email'            => $s['email'],
            'consignment_phone'            => $s['phone'],
            'consignment_phone_two'        => '',
            'consignment_phone_three'      => '',
            'consignment_address'          => $s['address'],
            'special_instructions'         => 'Please call before delivery. ' . $s['details'],
            'shipment_type'                => 'overnight',
            'return_address'               => config('services.leopard.return_address'),
            'return_city'                  => (int) config('services.leopard.return_city', 592),
            'is_vpc'                       => 0,
        ];

        $response = Http::timeout(self::TIMEOUT)->asJson()
            ->post(self::LEOPARD_BASE . '/bookPacket/format/json/', $payload + $this->leopardAuth());
        $body = $response->json() ?? [];

        $ok = (int) ($body['status'] ?? 0) === 1 && empty($body['error']) && ! empty($body['track_number']);

        return [
            'status'           => $ok ? 'booked' : 'failed',
            'tracking_number'  => $ok ? (string) $body['track_number'] : null,
            'destination_city' => $city['name'],
            'message'          => $ok ? 'Booked' : $this->leopardError($body, $response),
            'http_status'      => $response->status(),
            'request'          => $payload,
            'response'         => $body ?: ['raw' => mb_substr($response->body(), 0, 2000)],
        ];
    }

    /** [ ['id' => …, 'name' => …], … ] destinations Leopards delivers to */
    private function leopardCities(): array
    {
        return Cache::remember('courier.leopard.cities', self::CITY_CACHE_TTL, function () {
            $body = Http::timeout(self::TIMEOUT)->asJson()
                ->post(self::LEOPARD_BASE . '/getAllCities/format/json/', $this->leopardAuth())
                ->json();

            $cities = collect($body['city_list'] ?? [])
                ->filter(fn ($c) => ($c['allow_as_destination'] ?? true) == true)
                ->map(fn ($c) => ['id' => $c['id'], 'name' => trim($c['name'])])
                ->values()->all();

            if (! $cities) {
                throw new \RuntimeException('Leopards city list is empty: ' . ($body['error'] ?? 'no answer'));
            }

            return $cities;
        });
    }

    private function leopardAuth(): array
    {
        return [
            'api_key'      => config('services.leopard.api_key'),
            'api_password' => config('services.leopard.api_password'),
        ];
    }

    private function leopardError(array $body, Response $response): string
    {
        $error = $body['error'] ?? null;
        if (is_array($error)) {
            $error = collect($error)->flatten()->implode('; ');
        }

        return 'Leopards: ' . ($error ?: "no tracking number returned (HTTP {$response->status()})");
    }

    // ── PostEx ────────────────────────────────────────────────────

    private function bookPostEx(Order $order, array $s): array
    {
        $city = $this->findCity($this->postExCities(), $s['city'], 'PostEx');

        $payload = [
            'orderRefNumber'    => $order->order_number,
            'invoicePayment'    => $s['amount'],
            'orderDetail'       => mb_substr($s['details'], 0, 250),
            'customerName'      => $s['name'],
            'customerPhone'     => $this->localPhone($s['phone']),
            'deliveryAddress'   => $s['address'],
            'transactionNotes'  => 'Please call before delivery',
            'cityName'          => $city['name'],
            'invoiceDivision'   => 1,
            'items'             => $s['pieces'],
            'pickupAddressCode' => config('services.postex.pickup_address_code', '001'),
            'orderType'         => 'Normal',
            'bookingWeight'     => $s['weight'],
        ];

        $response = Http::timeout(self::TIMEOUT)->asJson()
            ->withHeaders(['token' => config('services.postex.api_token')])
            ->post(self::POSTEX_BASE . '/v3/create-order', $payload);
        $body = $response->json() ?? [];

        $tracking = data_get($body, 'dist.trackingNumber') ?? data_get($body, 'dist.0.trackingNumber');
        $ok = (string) ($body['statusCode'] ?? '') === '200' && $tracking;

        return [
            'status'           => $ok ? 'booked' : 'failed',
            'tracking_number'  => $ok ? (string) $tracking : null,
            'destination_city' => $city['name'],
            'message'          => $ok ? 'Booked' : 'PostEx: ' . ($body['statusMessage'] ?? "no tracking number returned (HTTP {$response->status()})"),
            'http_status'      => $response->status(),
            'request'          => $payload,
            'response'         => $body ?: ['raw' => mb_substr($response->body(), 0, 2000)],
        ];
    }

    /** PostEx works with city names — [ ['id' => name, 'name' => name], … ] */
    private function postExCities(): array
    {
        return Cache::remember('courier.postex.cities', self::CITY_CACHE_TTL, function () {
            $body = Http::timeout(self::TIMEOUT)
                ->withHeaders(['token' => config('services.postex.api_token')])
                ->get(self::POSTEX_BASE . '/v2/get-operational-city')
                ->json();

            $cities = collect($body['dist'] ?? [])
                ->filter(fn ($c) => ($c['isDeliveryCity'] ?? true) == true)
                ->map(fn ($c) => ['id' => trim($c['operationalCityName']), 'name' => trim($c['operationalCityName'])])
                ->values()->all();

            if (! $cities) {
                throw new \RuntimeException('PostEx city list is empty: ' . ($body['statusMessage'] ?? 'no answer'));
            }

            return $cities;
        });
    }

    /** 923001234567 → 03001234567 (PostEx wants the local form) */
    private function localPhone(?string $phone): string
    {
        $digits = preg_replace('/\D/', '', (string) $phone);

        return str_starts_with($digits, '92') ? '0' . substr($digits, 2) : $digits;
    }

    // ── Movex ─────────────────────────────────────────────────────

    private function bookMovex(Order $order, array $s): array
    {
        $headers = ['Authorization' => config('services.movex.api_token')];

        $cities = Cache::remember('courier.movex.cities', self::CITY_CACHE_TTL, fn () => collect(
            Http::timeout(self::TIMEOUT)->withHeaders($headers)->get(self::MOVEX_BASE . '/cities')->json('response', [])
        )->map(fn ($c) => ['id' => $c['city_id'], 'name' => trim($c['city_name'])])->values()->all());

        $city = $this->findCity($cities, $s['city'], 'Movex');

        $payload = [
            'consignee_mobile_number'   => $s['phone'],
            'consignee_email'           => $s['email'],
            'consignee_name'            => $s['name'],
            'consignee_address'         => $s['address'],
            'destination_city_id'       => $city['id'],
            'weight'                    => $s['weight'],
            'pieces'                    => $s['pieces'],
            'cod_amount'                => $s['amount'],
            'customer_reference_number' => $order->order_number,
            'product_detail'            => $s['details'],
            'origin_city_id'            => '1',
            'remarks'                   => 'Please call before delivery',
        ];

        $response = Http::timeout(self::TIMEOUT)->asJson()->withHeaders($headers)
            ->post(self::MOVEX_BASE . '/shipment/book', $payload);
        $body = $response->json() ?? [];
        $tracking = data_get($body, 'response.tracking_number');

        return [
            'status'           => $tracking ? 'booked' : 'failed',
            'tracking_number'  => $tracking ? (string) $tracking : null,
            'destination_city' => $city['name'],
            'message'          => $tracking ? 'Booked' : 'Movex: ' . ($body['message'] ?? "no tracking number returned (HTTP {$response->status()})"),
            'http_status'      => $response->status(),
            'request'          => $payload,
            'response'         => $body ?: ['raw' => mb_substr($response->body(), 0, 2000)],
        ];
    }

    // ── City matching ─────────────────────────────────────────────

    /** "Tando Mohd. Khan" → "tandomuhammadkhan" */
    public static function normalizeCity(string $name): string
    {
        $n = strtolower(trim($name));
        $n = preg_replace('/\bmohd\b\.?|\bmuhammed\b|\bmohammad\b|\bmohammed\b/', 'muhammad', $n);
        $n = preg_replace('/\s*\((.*?)\)/', '', $n);   // "Khar (Bajore Agency)" → "khar"

        return preg_replace('/[^a-z0-9]/', '', $n);
    }

    /**
     * The courier's city for our city name, or a failed booking result.
     *
     * @param  array<int, array{id: mixed, name: string}>  $cities
     * @return array{id: mixed, name: string}
     */
    private function findCity(array $cities, string $ourName, string $courier): array
    {
        if (trim($ourName) === '') {
            throw new CourierBookingFailed(['status' => 'failed', 'message' => "{$courier}: the order has no city — set the city and book again."]);
        }

        $index = [];
        foreach ($cities as $c) {
            $index[self::normalizeCity($c['name'])] ??= $c;
        }

        $key = self::normalizeCity($ourName);
        foreach ([$key, ...(self::CITY_ALIASES[$key] ?? [])] as $candidate) {
            if (isset($index[$candidate])) {
                return $index[$candidate];
            }
        }

        throw new CourierBookingFailed([
            'status'  => 'failed',
            'message' => "{$courier} does not deliver to a city named \"{$ourName}\" (not in its city list). "
                       . 'Pick the nearest city the courier knows, or book this parcel by hand.',
        ]);
    }
}
