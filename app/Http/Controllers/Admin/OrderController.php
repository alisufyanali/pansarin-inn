<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\OrderRepository;
use App\Http\Requests\Admin\OrderRequest;
use App\Models\Customer;
use App\Models\City;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(protected OrderRepository $orderRepository)
    {
        $this->middleware('permission:create.orders')->only(['create', 'store']);
        $this->middleware('permission:edit.orders')->only(['edit', 'update']);
        $this->middleware('permission:delete.orders')->only(['destroy']);
        $this->middleware('permission:view.orders')->only(['index', 'show', 'getData']);
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/Orders/Index', [
            'stats' => $this->orderRepository->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        try {
            $query = $this->orderRepository->getAllForDataTable($request);
            $orders = $query->paginate($request->get('perPage', 10));

            return response()->json([
                'data'         => $orders->map(fn ($o) => [
                    'id'             => $o->id,
                    'order_number'   => $o->order_number,
                    'subtotal'       => (float) ($o->subtotal ?? 0),
                    'grand_total'    => (float) ($o->grand_total ?? 0),
                    'status'         => $o->status,
                    'payment_status' => $o->payment_status,
                    'payment_method' => $o->payment_method,
                    'created_at'     => $o->created_at,
                    'customer'       => $o->customer ? [
                        'id'         => $o->customer->id,
                        'first_name' => $o->customer->first_name,
                        'last_name'  => $o->customer->last_name,
                        'phone'      => $o->customer->phone,
                    ] : null,
                    'city'           => $o->city ? ['name' => $o->city->name] : null,
                    'items'          => $o->items->map(fn ($item) => [
                        'product_name' => $item->meta['product_name'] ?? $item->product?->name ?? '—',
                        'variant_name' => $item->meta['variant_name'] ?? null,
                        'quantity'     => $item->quantity,
                        'price'        => (float) $item->price,
                    ]),
                ]),
                'total'        => $orders->total(),
                'per_page'     => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
            ]);
        } catch (\Exception $e) {
            Log::error('Orders getData: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
        }
    }

    public function create()
    {
        return Inertia::render('Admin/Orders/Create', [
            'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone', 'email', 'address', 'address2', 'city_id']),
            'products'  => $this->orderRepository->getProductsForForm(),
            'cities'    => City::orderBy('province')->orderBy('name')->get(['id', 'name', 'province', 'shipping_charges']),
        ]);
    }

    public function store(OrderRequest $request)
    {
        try {
            $this->orderRepository->store($request->validated());
            return to_route('admin.orders.index')->with('success', 'Order created!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e; // Let Inertia handle it as 422 with errors
        } catch (\Exception $e) {
            Log::error('Order store: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(string $id)
    {
        try {
            return Inertia::render('Admin/Orders/Show', [
                'order' => $this->orderRepository->find($id),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.orders.index')->with('error', 'Order not found');
        }
    }

    public function edit(string $id)
    {
        try {
            return Inertia::render('Admin/Orders/Edit', [
                'order'     => $this->orderRepository->find($id),
                'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone', 'email', 'address', 'address2', 'city_id']),
                'products'  => $this->orderRepository->getProductsForForm(),
                'cities'    => City::orderBy('province')->orderBy('name')->get(['id', 'name', 'province', 'shipping_charges']),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.orders.index')->with('error', 'Order not found');
        }
    }

    public function update(OrderRequest $request, string $id)
    {
        try {
            $this->orderRepository->update($id, $request->validated());
            return to_route('admin.orders.index')->with('success', 'Order updated!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Order update: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->orderRepository->delete($id);
            return to_route('admin.orders.index')->with('success', 'Order deleted!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete order');
        }
    }

    public function bulkSendEmail(Request $request)
    {
        try {
            $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:orders,id']);

            $orders = \App\Models\Order::with(['customer', 'items.product'])
                ->whereIn('id', $request->ids)
                ->get();

            $sent = 0;
            foreach ($orders as $order) {
                if ($order->customer?->email) {
                    \App\Jobs\SendOrderConfirmationEmail::dispatch($order);
                    $sent++;
                }
            }

            return response()->json(['success' => true, 'sent' => $sent]);
        } catch (\Exception $e) {
            Log::error('Bulk email error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function bulkSendWhatsApp(Request $request)
    {
        try {
            $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:orders,id']);

            $orders = \App\Models\Order::with(['customer', 'items.product'])
                ->whereIn('id', $request->ids)
                ->get();

            $sent = 0;
            foreach ($orders as $order) {
                if ($order->customer?->phone) {
                    \App\Jobs\SendOrderWhatsAppNotification::dispatch($order);
                    $sent++;
                }
            }

            return response()->json(['success' => true, 'sent' => $sent]);
        } catch (\Exception $e) {
            Log::error('Bulk WhatsApp error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded',
            ]);
            $this->orderRepository->updateStatus($id, $validated['status']);
            return back()->with('success', 'Status updated!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function updatePaymentStatus(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
                'payment_date'   => 'nullable|date',
            ]);
            $this->orderRepository->updatePaymentStatus($id, $validated);
            return back()->with('success', 'Payment status updated!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function track(Request $request)
    {
        $order    = null;
        $error    = null;
        $searched = $request->filled('order_number');

        if ($searched) {
            $found = \App\Models\Order::with([
                'customer:id,first_name,last_name,email,phone',
                'city:id,name',
                'items.product:id,name',
                'items.variant:id,sku,value,attributes',
            ])->where('order_number', $request->order_number)->first();

            if (!$found) {
                $error = "No order found with number \"{$request->order_number}\".";
            } else {
                $order = [
                    'id'               => $found->id,
                    'order_number'     => $found->order_number,
                    'status'           => $found->status,
                    'payment_status'   => $found->payment_status,
                    'payment_method'   => $found->payment_method,
                    'subtotal'         => (float) $found->subtotal,
                    'shipping_charges' => (float) $found->shipping_charges,
                    'product_discount' => (float) $found->product_discount,
                    'invoice_discount' => (float) $found->invoice_discount,
                    'tax'              => (float) $found->tax,
                    'grand_total'      => (float) $found->grand_total,
                    'order_note'       => $found->order_note,
                    'shipping_address' => $found->shipping_address,
                    'shipping_method'  => $found->shipping_method,
                    'created_at'       => $found->created_at,
                    'customer'         => $found->customer ? [
                        'id'    => $found->customer->id,
                        'name'  => trim(($found->customer->first_name ?? '').' '.($found->customer->last_name ?? '')),
                        'email' => $found->customer->email,
                        'phone' => $found->customer->phone,
                    ] : null,
                    'city'  => $found->city ? ['id' => $found->city->id, 'name' => $found->city->name] : null,
                    'items' => $found->items->map(function ($item) {
                        $variantLabel = null;
                        if ($item->variant) {
                            $attrs = $item->variant->attributes;
                            $variantLabel = (!empty($attrs) && is_array($attrs))
                                ? implode(' / ', array_values($attrs))
                                : ($item->variant->value ?: $item->variant->sku);
                        }
                        return [
                            'id'            => $item->id,
                            'product_name'  => $item->product?->name ?? 'Unknown Product',
                            'variant_label' => $variantLabel,
                            'quantity'      => $item->quantity,
                            'unit_price'    => (float) $item->unit_price,
                            'subtotal'      => (float) $item->subtotal,
                        ];
                    })->values(),
                ];
            }
        }

        return Inertia::render('Admin/Orders/Track', [
            'order'    => $order,
            'error'    => $error,
            'searched' => $searched,
        ]);
    }
}