<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\OrderRepository;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrderApiController extends Controller
{
    public function __construct(protected OrderRepository $orderRepo) {}

    // GET /api/orders
    public function index(Request $request)
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json(['success' => false, 'message' => 'Customer profile not found.'], 404);
        }

        $orders = Order::with(['items', 'city:id,name'])
            ->where('customer_id', $customer->id)
            ->latest()
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data'    => $orders->map(fn ($o) => $this->formatOrder($o)),
            'meta'    => [
                'total'        => $orders->total(),
                'per_page'     => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
            ],
        ]);
    }

    // GET /api/orders/{id}
    public function show(Request $request, string $id)
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json(['success' => false, 'message' => 'Customer profile not found.'], 404);
        }

        $order = Order::with(['items.product', 'items.variant', 'city:id,name'])
            ->where('customer_id', $customer->id)
            ->findOrFail($id);

        $order->items->transform(function ($item) {
            $item->product_name  = $item->meta['product_name'] ?? $item->product?->name;
            $item->variant_label = $item->meta['variant_name'] ?? $item->variant?->value;
            return $item;
        });

        return response()->json([
            'success' => true,
            'data'    => $this->formatOrder($order, detailed: true),
        ]);
    }

    // POST /api/orders
    public function store(Request $request)
    {
        $request->validate([
            'city_id'               => 'nullable|exists:cities,id',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.price'         => 'required|numeric|min:0',
            'items.*.discount'      => 'nullable|numeric|min:0',
            'payment_method'        => 'nullable|string|max:100',
            'shipping_address'      => 'nullable|string',
            'billing_address'       => 'nullable|string',
            'order_note'            => 'nullable|string',
            'invoice_discount'      => 'nullable|numeric|min:0',
            'shipping_charges'      => 'nullable|numeric|min:0',
        ]);

        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json(['success' => false, 'message' => 'Customer profile not found.'], 404);
        }

        try {
            $order = $this->orderRepo->store(array_merge($request->all(), [
                'customer_id'    => $customer->id,
                'status'         => 'pending',
                'payment_status' => 'unpaid',
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully.',
                'data'    => $this->formatOrder($order),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('API Order store: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to place order.'], 500);
        }
    }

    // ── Format Helper ─────────────────────────────────────────────
    private function formatOrder(Order $o, bool $detailed = false): array
    {
        $base = [
            'id'             => $o->id,
            'order_number'   => $o->order_number,
            'status'         => $o->status,
            'payment_status' => $o->payment_status,
            'payment_method' => $o->payment_method,
            'grand_total'    => (float) $o->grand_total,
            'subtotal'       => (float) ($o->subtotal ?? 0),
            'shipping'       => (float) ($o->shipping_charges ?? 0),
            'discount'       => (float) ($o->invoice_discount ?? 0),
            'tax'            => (float) ($o->tax ?? 0),
            'city'           => $o->city ? $o->city->name : null,
            'created_at'     => $o->created_at,
        ];

        if ($detailed) {
            $base['items']            = $o->items->map(fn ($item) => [
                'id'           => $item->id,
                'product_name' => $item->product_name ?? $item->meta['product_name'] ?? null,
                'variant'      => $item->variant_label ?? $item->meta['variant_name'] ?? null,
                'quantity'     => $item->quantity,
                'price'        => (float) $item->price,
                'discount'     => (float) ($item->discount ?? 0),
                'subtotal'     => (float) $item->subtotal,
            ]);
            $base['shipping_address'] = $o->shipping_address;
            $base['billing_address']  = $o->billing_address;
            $base['order_note']       = $o->order_note;
            $base['tracking']         = $o->shipping_response ?? null;
        }

        return $base;
    }
}
