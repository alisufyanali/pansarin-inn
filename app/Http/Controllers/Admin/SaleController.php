<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\SaleRepository;
use App\Http\Requests\Admin\SaleRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function __construct(protected SaleRepository $saleRepository)
    {
        // $this->middleware('permission:create.sales')->only(['create', 'store']);
        // $this->middleware('permission:edit.sales')->only(['edit', 'update']);
        // $this->middleware('permission:delete.sales')->only(['destroy']);
        // $this->middleware('permission:view.sales')->only(['index', 'show', 'getData']);
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/Sales/Index', [
            'stats' => $this->saleRepository->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        try {
            $query = $this->saleRepository->getAllForDataTable($request);
            $sales = $query->paginate($request->get('perPage', 10));

            return response()->json([
                'data'         => $sales->map(fn ($s) => [
                    'id'              => $s->id,
                    'sale_code'       => $s->sale_code,
                    'grand_total'     => (float) ($s->grand_total ?? 0),
                    'subtotal'        => (float) ($s->subtotal ?? 0),
                    'delivery_status' => $s->delivery_status,
                    'payment_status'  => $s->payment_status,
                    'payment_type'    => $s->payment_type,
                    'created_at'      => $s->created_at,
                    'customer'        => $s->customer ? [
                        'id'         => $s->customer->id,
                        'first_name' => $s->customer->first_name,
                        'last_name'  => $s->customer->last_name,
                        'phone'      => $s->customer->phone,
                    ] : null,
                    'order'           => $s->order ? [
                        'id'           => $s->order->id,
                        'order_number' => $s->order->order_number,
                    ] : null,
                ]),
                'total'        => $sales->total(),
                'per_page'     => $sales->perPage(),
                'current_page' => $sales->currentPage(),
                'last_page'    => $sales->lastPage(),
            ]);
        } catch (\Exception $e) {
            Log::error('Sales getData: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
        }
    }

    // Create sale — direct (bina order ke)
    public function create()
    {
        return Inertia::render('Admin/Sales/Create', [
            'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone', 'email']),
            'products'  => $this->saleRepository->getProductsForForm(),
            'order'     => null,
        ]);
    }

    // Create sale — order se (Orders Index ka button)
    public function createFromOrder(string $orderId)
    {
        try {
            $order = Order::with(['customer', 'items.product', 'items.variant'])->findOrFail($orderId);

            return Inertia::render('Admin/Sales/Create', [
                'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone', 'email']),
                'products'  => $this->saleRepository->getProductsForForm(),
                'order'     => [
                    'id'              => $order->id,
                    'order_number'    => $order->order_number,
                    'customer_id'     => $order->customer_id,
                    'shipping_address'=> $order->shipping_address,
                    'billing_address' => $order->billing_address,
                    'shipping_method' => $order->shipping_method,
                    'shipping_charges'=> $order->shipping_charges,
                    'invoice_discount'=> $order->invoice_discount,
                    'grand_total'     => $order->grand_total,
                    'customer'        => $order->customer ? [
                        'id'         => $order->customer->id,
                        'first_name' => $order->customer->first_name,
                        'last_name'  => $order->customer->last_name,
                        'phone'      => $order->customer->phone,
                        'email'      => $order->customer->email,
                    ] : null,
                    'items' => $order->items->map(fn ($item) => [
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity'           => $item->quantity,
                        'price'              => $item->price,
                        'discount'           => $item->discount,
                        'subtotal'           => $item->subtotal,
                        'product_name'       => $item->meta['product_name'] ?? $item->product?->name,
                        'variant_name'       => $item->meta['variant_name'] ?? $item->variant?->value,
                        'sku'                => $item->meta['sku'] ?? $item->product?->sku,
                    ]),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Sale createFromOrder: ' . $e->getMessage());
            return redirect()->route('admin.orders.index')->with('error', 'Order not found');
        }
    }

    public function store(SaleRequest $request)
    {
        try {
            $this->saleRepository->store($request->validated());
            return to_route('admin.sales.index')->with('success', 'Sale created successfully!');
        } catch (\Exception $e) {
            Log::error('Sale store: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(string $id)
    {
        try {
            return Inertia::render('Admin/Sales/Show', [
                'sale' => $this->saleRepository->find($id),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.sales.index')->with('error', 'Sale not found');
        }
    }

    public function edit(string $id)
    {
        try {
            return Inertia::render('Admin/Sales/Edit', [
                'sale'      => $this->saleRepository->find($id),
                'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone', 'email']),
                'products'  => $this->saleRepository->getProductsForForm(),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.sales.index')->with('error', 'Sale not found');
        }
    }

    public function update(SaleRequest $request, string $id)
    {
        try {
            $this->saleRepository->update($id, $request->validated());
            return to_route('admin.sales.index')->with('success', 'Sale updated!');
        } catch (\Exception $e) {
            Log::error('Sale update: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->saleRepository->delete($id);
            return to_route('admin.sales.index')->with('success', 'Sale deleted!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete sale');
        }
    }

    public function updateDeliveryStatus(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'delivery_status'   => 'required|in:pending,processing,shipped,delivered,cancelled,returned',
                'delivery_datetime' => 'nullable|date',
            ]);
            $this->saleRepository->updateDeliveryStatus($id, $validated);
            return back()->with('success', 'Delivery status updated!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function updatePaymentStatus(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'payment_status'    => 'required|in:unpaid,paid,partially_paid,refunded',
                'payment_timestamp' => 'nullable|date',
            ]);
            $this->saleRepository->updatePaymentStatus($id, $validated);
            return back()->with('success', 'Payment status updated!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}