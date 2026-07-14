<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Sale;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CourierService
{
    /**
     * Book shipment based on order's shipping_method.
     * If $sale is provided, city is resolved from sale first (sale may have its own city_id).
     * Returns tracking number or response string.
     */
    public function book(Order $order, ?Sale $sale = null): ?string
    {
        $order->loadMissing(['customer', 'items.product']);

        // Resolve city: prefer sale's city, fall back to order's city
        if ($sale && $sale->city_id) {
            $sale->loadMissing('city');
            $order->setRelation('city', $sale->city);
        } else {
            $order->loadMissing('city');
        }

        $method = $order->shipping_method;

        try {
            return match ($method) {
                'movex'   => $this->bookMovex($order),
                'px'      => $this->bookPostEx($order),
                'leopard' => $this->bookLeopard($order),
                default   => null,
            };
        } catch (\Throwable $e) {
            Log::error("Courier booking failed [{$method}]", [
                'order_id' => $order->id,
                'error'    => $e->getMessage(),
            ]);
            return null;
        }
    }

    // ── Movex ─────────────────────────────────────────────────────

    private function bookMovex(Order $order): ?string
    {
        $movexToken = config('services.movex.api_token');

        // Get Movex city ID by matching city name
        $cityId = 0;
        $cityName = strtolower($order->city?->name ?? '');

        if ($cityName) {
            $res = Http::withHeaders(['Authorization' => $movexToken])
                ->get('https://tracking.movexpk.com/api/cities');

            if ($res->successful()) {
                foreach ($res->json('response', []) as $c) {
                    if (strtolower($c['city_name']) === $cityName) {
                        $cityId = $c['city_id'];
                        break;
                    }
                }
            }
        }

        $customer = $order->customer;
        $items    = $order->items;

        $productDetail = $items->map(fn ($i) => $i->meta['product_name'] ?? '')->filter()->join(', ');

        $response = Http::withHeaders([
            'Content-Type'  => 'application/json',
            'Authorization' => $movexToken,
        ])->post('https://tracking.movexpk.com/api/shipment/book', [
            'consignee_mobile_number'    => $customer?->phone,
            'consignee_email'            => $customer?->email ?? '',
            'consignee_name'             => $customer?->full_name ?? $customer?->first_name,
            'consignee_address'          => $order->shipping_address,
            'destination_city_id'        => $cityId,
            'weight'                     => $order->courier_weight ?? 1,
            'pieces'                     => $items->count() ?: 1,
            'cod_amount'                 => round($order->grand_total),
            'customer_reference_number'  => $order->order_number,
            'product_detail'             => $productDetail ?: 'Herbal Products',
            'origin_city_id'             => '1',
            'remarks'                    => 'Please call before delivery',
        ]);

        $tracking = $response->json('response.tracking_number');

        Log::info('Movex booked', ['order' => $order->order_number, 'tracking' => $tracking]);

        return $tracking;
    }

    // ── PostEx ────────────────────────────────────────────────────

    private function bookPostEx(Order $order): ?string
    {
        $customer = $order->customer;

        $response = Http::withHeaders([
            'token'        => config('services.postex.api_token'),
            'Content-Type' => 'application/json',
        ])->post('https://api.postex.pk/services/integration/api/order/v3/create-order', [
            'orderRefNumber'       => $order->order_number,
            'invoicePayment'       => $order->grand_total,
            'orderDetail'          => 'Herbal Products',
            'customerName'         => $customer?->full_name ?? $customer?->first_name,
            'customerPhone'        => $customer?->phone,
            'deliveryAddress'      => trim(($order->shipping_address ?? '') . ' ' . ($order->billing_address ?? '')),
            'transactionNotes'     => 'Please call before delivery',
            'cityName'             => $order->city?->name ?? '',
            'invoiceDivision'      => '1',
            'items'                => $order->items->count() ?: 1,
            'pickupAddressCode'    => '001',
            'orderType'            => 'Normal',
            'bookingWeight'        => $order->courier_weight ?? 0.5,
        ]);

        $tracking = $response->json('dist.0.trackingNumber')
            ?? $response->json('dist.trackingNumber')
            ?? $response->json('trackingNumber')
            ?? $response->json('data.trackingNumber');

        Log::info('PostEx full response', [
            'order'   => $order->order_number,
            'status'  => $response->status(),
            'body'    => $response->json(),
            'tracking' => $tracking,
        ]);

        return $tracking;
    }

    // ── Leopard ───────────────────────────────────────────────────

    private function bookLeopard(Order $order): ?string
    {
        $customer = $order->customer;
        $cityId   = $this->getLeopardCityId($order->city?->name ?? '');

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post('https://merchantapi.leopardscourier.com/api/bookPacket/format/json/', [
                'api_key'                    => config('services.leopard.api_key'),
                'api_password'               => config('services.leopard.api_password'),
                'booked_packet_weight'       => $order->courier_weight ?? 0.5,
                'booked_packet_no_piece'     => 1,
                'booked_packet_collect_amount' => $order->grand_total,
                'booked_packet_vol_weight_w' => 0,
                'booked_packet_vol_weight_l' => 0,
                'booked_packet_vol_weight_h' => 0,
                'booked_packet_order_id'     => $order->order_number,
                'origin_city'                => config('services.leopard.origin_city', 592),
                'destination_city'           => $cityId,
                'shipment_id'                => config('services.leopard.shipment_id'),
                'shipment_name_eng'          => 'Self',
                'shipment_email'             => config('services.leopard.shipment_email'),
                'shipment_phone'             => config('services.leopard.shipment_phone'),
                'shipment_address'           => config('services.leopard.shipment_address'),
                'consignment_name_eng'       => $customer?->full_name ?? $customer?->first_name,
                'consignment_email'          => $customer?->email ?? '',
                'consignment_phone'          => $customer?->phone,
                'consignment_phone_two'      => '',
                'consignment_phone_three'    => '',
                'consignment_address'        => $order->shipping_address ?? '',
                'special_instructions'       => 'CALL ZAROOR KARIEN AND DELIVER ZAROOR KAREIN',
                'shipment_type'              => 'overnight',
                'return_address'             => config('services.leopard.return_address'),
                'return_city'                => config('services.leopard.return_city', 592),
                'is_vpc'                     => 0,
            ]);

        $result = $response->json();

        if (($result['status'] ?? 0) == 1 && ($result['error'] ?? 1) == 0) {
            $tracking = $result['track_number'];
            Log::info('Leopard booked', ['order' => $order->order_number, 'tracking' => $tracking]);
            return 'Track Number: ' . $tracking;
        }

        Log::warning('Leopard booking failed', ['order' => $order->order_number, 'response' => $result]);
        return null;
    }

    // ── Helpers ───────────────────────────────────────────────────

    private function getLeopardCityId(string $cityName): int
    {
        // Common city mappings — extend as needed
        $map = [
            'karachi'     => 592,
            'lahore'      => 593,
            'islamabad'   => 594,
            'rawalpindi'  => 595,
            'faisalabad'  => 596,
            'multan'      => 597,
            'peshawar'    => 598,
            'quetta'      => 599,
            'hyderabad'   => 600,
            'sialkot'     => 601,
        ];

        return $map[strtolower($cityName)] ?? 592; // default Karachi
    }
}
