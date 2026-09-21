<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Helpers\PhoneHelper;
use App\Http\Repositories\Admin\OrderRepository;
use App\Jobs\SendOrderConfirmationEmail;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use App\Services\CustomerIdentityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class OrderApiController extends Controller
{
    public function __construct(
        protected OrderRepository $orderRepo,
        protected CustomerIdentityService $identity,
    ) {}

    // PATCH /api/orders/{id}/cancel
    public function cancel(Request $request, string $id)
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json(['success' => false, 'message' => 'Customer profile not found.'], 404);
        }

        $order = Order::where('customer_id', $customer->id)->findOrFail($id);

        $order->loadMissing('sale');

        // Only pending or processing orders can be cancelled by the customer
        if (! in_array($order->display_status, ['pending', 'processing'])) {
            return response()->json([
                'success' => false,
                'message' => 'This order cannot be cancelled. Only pending or processing orders are eligible.',
            ], 422);
        }

        $order->update(['status' => 'cancelled']);

        // Notify all admins of the customer-initiated order cancellation
        try {
            $admins = \App\Models\User::role('admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\OrderCancelledNotification($order));
            }
        } catch (\Throwable $notifyEx) {
            Log::error('OrderCancelledNotification dispatch failed', [
                'order_id' => $order->id,
                'error'    => $notifyEx->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully.',
            'data'    => [
                'order_number' => $order->order_number,
                'status'       => $order->display_status,
            ],
        ]);
    }

    // GET /api/orders
    public function index(Request $request)
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json(['success' => false, 'message' => 'Customer profile not found.'], 404);
        }

        $orders = Order::with(['items', 'city:id,name', 'sale', 'customer'])
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

        $order = Order::with(['items.product', 'items.variant', 'city:id,name', 'sale', 'customer'])
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

        $user = $request->user();
        $normalized = PhoneHelper::normalize($user->username ?? $user->phone ?? '');
        if (! $normalized) {
            return response()->json(['success' => false, 'message' => 'Your account has no valid phone number.'], 422);
        }

        [, $customer] = $this->identity->findOrCreateByPhone($normalized, [
            'first_name' => $user->name,
            'email'      => $user->email,
            'status'     => 'active',
        ]);

        try {
            $order = $this->orderRepo->store(array_merge($request->all(), [
                'customer_id'    => $customer->id,
                'status'         => 'pending',
                'payment_status' => 'unpaid',
            ]));

            // Dispatch confirmation email — only reached if order was saved successfully.
            // Wrapped independently so a mail failure never rolls back the order response.
            try {
                SendOrderConfirmationEmail::dispatch($order);
            } catch (\Throwable $mailEx) {
                Log::error('SendOrderConfirmationEmail dispatch failed', [
                    'order_id' => $order->id,
                    'error'    => $mailEx->getMessage(),
                ]);
            }

            // Dispatch admin notification email
            try {
                Mail::to(config('mail.admin_email'))->queue(new \App\Mail\AdminNewOrderNotification($order));
            } catch (\Throwable $mailEx) {
                Log::error('AdminNewOrderNotification dispatch failed', [
                    'order_id' => $order->id,
                    'error'    => $mailEx->getMessage(),
                ]);
            }

            // Notify all admin users via the bell (database notification)
            try {
                $admins = \App\Models\User::role('admin')->get();
                foreach ($admins as $admin) {
                    $admin->notify(new \App\Notifications\NewOrderNotification($order));
                }
            } catch (\Throwable $notifyEx) {
                Log::error('NewOrderNotification (bell) dispatch failed', [
                    'order_id' => $order->id,
                    'error'    => $notifyEx->getMessage(),
                ]);
            }

            // Dispatch WhatsApp notification if customer has phone
            if ($customer->phone) {
                try {
                    \App\Jobs\SendOrderWhatsAppNotification::dispatch($order);
                } catch (\Throwable $whatsappEx) {
                    Log::error('SendOrderWhatsAppNotification dispatch failed', [
                        'order_id' => $order->id,
                        'error'    => $whatsappEx->getMessage(),
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully.',
                'data'    => $this->formatOrder($order->load('customer')),
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

    // GET /api/orders/track?order_number=X&email=Y  — public, no auth required
    public function track(Request $request)
    {
        try {
            $request->validate([
                'order_number' => 'required|string',
                'email'        => 'nullable|email',
                'phone'        => 'nullable|string|max:30',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        // ── Step 1: Look up by order_number in orders table ──────────
        $query = Order::with(['items.product', 'items.variant', 'city:id,name', 'customer', 'sale'])
            ->where('order_number', $request->order_number);
        if ($request->filled('phone')) {
            $phone = PhoneHelper::normalize($request->phone);
            if ($phone) {
                $query->where(function ($q) use ($phone) {
                    $q->where('customer_phone', $phone)
                        ->orWhereHas('customer', fn ($c) => $c->where('phone', $phone));
                });
            }
        } elseif ($request->filled('email')) {
            $query->where(function ($q) use ($request) {
                $q->where('customer_email', $request->email)
                    ->orWhereHas('customer', fn ($c) => $c->where('email', $request->email));
            });
        }

        $order = $query->first();

        if ($order) {
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

        // ── Step 2: If not found, try sale_code in sales table ───────
        // (Covers admin-created direct/orderless "phone" sales)
        $saleQuery = \App\Models\Sale::with(['items.product', 'city:id,name', 'customer', 'order'])
            ->where('sale_code', $request->order_number);
        if ($request->filled('email')) {
            $saleQuery->whereHas('customer', function ($q) use ($request) {
                $q->where('email', $request->email);
            });
        }

        $sale = $saleQuery->first();

        if (! $sale) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatSaleAsOrder($sale, detailed: true),
        ]);
    }

    // POST /api/orders/guest  — public, no auth required (never returns Sanctum token)
    public function storeGuest(Request $request)
    {
        try {
            $request->validate([
                'name'             => 'required|string|max:255',
                'email'            => 'nullable|email|max:255',
                'phone'            => 'required|string|max:30',
                'shipping_address' => 'required|string',
                'billing_address'  => 'nullable|string',
                'city_id'          => 'nullable|integer|exists:cities,id',
                'payment_method'   => 'nullable|string|max:100',
                'order_note'       => 'nullable|string',
                'shipping_charges' => 'nullable|numeric|min:0',
                'invoice_discount' => 'nullable|numeric|min:0',
                'items'            => 'required|array|min:1',
                'items.*.product_id'         => 'required|exists:products,id',
                'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
                'items.*.quantity'           => 'required|integer|min:1',
                'items.*.price'              => 'required|numeric|min:0',
                'items.*.discount'           => 'nullable|numeric|min:0',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        $normalizedPhone = PhoneHelper::normalize($request->phone);
        if (! $normalizedPhone) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Pakistani mobile number.',
            ], 422);
        }

        $parts = preg_split('/\s+/', trim($request->name), 2);
        [, $customer, $accountCreated] = DB::transaction(fn () => $this->identity->findOrCreateByPhone($normalizedPhone, [
            'first_name' => $parts[0],
            'last_name'  => $parts[1] ?? null,
            'email'      => $request->email,
            'address'    => $request->shipping_address,
            'city_id'    => $request->city_id ?? null,
            'status'     => 'active',
        ]));

        try {
            $order = $this->orderRepo->store(array_merge($request->only([
                'city_id', 'payment_method', 'shipping_address', 'billing_address',
                'order_note', 'invoice_discount', 'shipping_charges', 'items',
            ]), [
                'customer_id'    => $customer->id,
                'status'         => 'pending',
                'payment_status' => 'unpaid',
                'tax'            => 0,
            ]));

            try {
                SendOrderConfirmationEmail::dispatch($order);
            } catch (\Throwable $mailEx) {
                Log::error('SendOrderConfirmationEmail dispatch failed (guest)', [
                    'order_id' => $order->id,
                    'error'    => $mailEx->getMessage(),
                ]);
            }

            try {
                Mail::to(config('mail.admin_email'))->queue(new \App\Mail\AdminNewOrderNotification($order));
            } catch (\Throwable $mailEx) {
                Log::error('AdminNewOrderNotification dispatch failed (guest)', [
                    'order_id' => $order->id,
                    'error'    => $mailEx->getMessage(),
                ]);
            }

            try {
                $admins = User::role('admin')->get();
                foreach ($admins as $admin) {
                    $admin->notify(new \App\Notifications\NewOrderNotification($order));
                }
            } catch (\Throwable $notifyEx) {
                Log::error('NewOrderNotification (bell) dispatch failed (guest)', [
                    'order_id' => $order->id,
                    'error'    => $notifyEx->getMessage(),
                ]);
            }

            if ($customer->phone) {
                try {
                    \App\Jobs\SendOrderWhatsAppNotification::dispatch($order);
                } catch (\Throwable $whatsappEx) {
                    Log::error('SendOrderWhatsAppNotification dispatch failed (guest)', [
                        'order_id' => $order->id,
                        'error'    => $whatsappEx->getMessage(),
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully.',
                'data'    => $this->formatOrder($order->load('customer'), accountCreated: $accountCreated),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('API Guest Order store: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to place order.'], 500);
        }
    }

    // ── Format Helper ─────────────────────────────────────────────
    private function formatOrder(Order $o, bool $detailed = false, bool $accountCreated = false): array
    {
        $base = [
            'id'              => $o->id,
            'order_number'    => $o->order_number,
            'status'          => $o->display_status,
            'payment_status'  => $o->payment_status,
            'payment_method'  => $o->payment_method,
            'grand_total'     => (float) $o->grand_total,
            'subtotal'        => (float) ($o->subtotal ?? 0),
            'shipping'        => (float) ($o->shipping_charges ?? 0),
            'discount'        => (float) ($o->invoice_discount ?? 0),
            'tax'             => (float) ($o->tax ?? 0),
            'city'            => $o->city ? $o->city->name : null,
            'created_at'      => $o->created_at,
            'account_created' => $accountCreated,
            'customer_name'   => $o->customer_name ?? $o->customer?->full_name,
            'customer_email'  => $o->customer_email ?? $o->customer?->email,
            'customer_phone'  => $o->customer_phone ?? $o->customer?->phone,
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
            $trackingFromSale = $o->sale?->shipping_response;
            $trackingFromOrder = $o->shipping_response ?? null;
            $base['tracking']         = $trackingFromSale ?: $trackingFromOrder;
        }

        return $base;
    }

    private function formatSaleAsOrder(\App\Models\Sale $s, bool $detailed = false): array
    {
        $orderNumber = $s->order?->order_number ?? $s->sale_code;
        $base = [
            'id'              => $s->id,
            'order_number'    => $orderNumber,
            'sale_code'       => $s->sale_code,
            'status'          => $s->display_status,
            'payment_status'  => $s->payment_status,
            'payment_method'  => $s->payment_type,
            'grand_total'     => (float) $s->grand_total,
            'subtotal'        => (float) ($s->subtotal ?? 0),
            'shipping'        => (float) ($s->shipping_charges ?? 0),
            'discount'        => (float) ($s->invoice_discount ?? 0),
            'tax'             => (float) ($s->vat ?? 0),
            'city'            => $s->city ? $s->city->name : ($s->customer?->city?->name ?? null),
            'created_at'      => $s->sale_datetime ?? $s->created_at,
            'account_created' => false,
        ];

        if ($detailed) {
            $base['items']            = $s->items->map(fn ($item) => [
                'id'           => $item->id,
                'product_name' => $item->meta['product_name'] ?? $item->product?->name ?? null,
                'variant'      => $item->meta['variant_name'] ?? null,
                'quantity'     => $item->quantity,
                'price'        => (float) $item->price,
                'discount'     => (float) ($item->discount ?? 0),
                'subtotal'     => (float) $item->subtotal,
            ]);
            $base['shipping_address'] = $s->shipping_address ?? $s->customer?->address ?? null;
            $base['billing_address']  = null;
            $base['order_note']       = $s->remarks ?? null;
            $base['tracking']         = $s->shipping_response ?? null;
        }

        return $base;
    }
}
