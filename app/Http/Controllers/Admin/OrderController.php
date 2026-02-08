<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariant;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\DB;
use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderWhatsAppNotification;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:create.orders')->only(['create', 'store']);
        $this->middleware('permission:edit.orders')->only(['edit', 'update']);
        $this->middleware('permission:delete.orders')->only(['destroy']);
        $this->middleware('permission:view.orders')->only(['index', 'show', 'getData']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Calculate stats
        $stats = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'totalRevenue' => Order::where('payment_status', 'paid')->sum('grand_total'),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }

    /**
     * Get DataTable data
     */
    public function getData(Request $request)
    {
        $query = Order::with(['customer'])->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhere('status', 'like', "%{$search}%")
                      ->orWhere('payment_status', 'like', "%{$search}%")
                      ->orWhereHas('customer', function($q) use ($search) {
                          $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                      });
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('order_number', 'like', "%{$search}%")
                          ->orWhere('status', 'like', "%{$search}%")
                          ->orWhere('payment_status', 'like', "%{$search}%")
                          ->orWhereHas('customer', function($q) use ($search) {
                              $q->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                          });
                    });
                }
            }
        }
        
        // Filters
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }
        
        if ($request->has('payment_status') && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }

        return DataTables::of($query)
            ->addColumn('customer_name', function($order) {
                return $order->customer ? $order->customer->full_name : null;
            })
            ->make(true);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Orders/Create', [
            'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone', 'email']),
            'products' => Product::with(['variants:id,product_id,name,price,stock'])
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'price', 'stock']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, AffiliateService $affiliateService)
    {
        // $order = Order::find(1);
        // SendOrderConfirmationEmail::dispatch($order);
        // return 1;

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'invoice_discount' => 'nullable|numeric|min:0',
            'shipping_charges' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded',
            'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
            'payment_method' => 'nullable|string|max:100',
            'payment_date' => 'nullable|date',
            'shipping_method' => 'nullable|string|max:100',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'order_note' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Create order
            $order = Order::create([
                'customer_id' => $validated['customer_id'],
                'order_number' => Order::generateOrderNumber(),
                'invoice_discount' => $validated['invoice_discount'] ?? 0,
                'shipping_charges' => $validated['shipping_charges'] ?? 0,
                'tax' => $validated['tax'] ?? 0,
                'status' => $validated['status'],
                'payment_status' => $validated['payment_status'],
                'payment_method' => $validated['payment_method'] ?? null,
                'payment_date' => $validated['payment_date'] ?? null,
                'shipping_method' => $validated['shipping_method'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
                'billing_address' => $validated['billing_address'] ?? null,
                'order_note' => $validated['order_note'] ?? null,
            ]);

            // Create order items
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                $variant = isset($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                $subtotal = ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);

                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $subtotal,
                    'meta' => [
                        'product_name' => $product->name,
                        'sku' => $product->sku,
                        'variant_name' => $variant?->name ?? null,
                    ],
                ]);
            }

            // Calculate totals
            $order->calculateTotals();

            // Affiliate Commission Calculate
            $affiliateService->recordReferral($order);
            if ($order->status === 'delivered') {
                $affiliateService->finalizeCommission($order);
            }

            // Dispatch email job
            SendOrderConfirmationEmail::dispatch($order);

            // Send WhatsApp notification
            SendOrderWhatsAppNotification::dispatch($order);

            DB::commit();
            return to_route('admin.orders.index')->with('success', 'Order successfully created! Confirmation email will be sent shortly.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create order: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $order = Order::with(['customer', 'items.product', 'items.variant'])->findOrFail($id);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $order = Order::with(['customer', 'items.product', 'items.variant'])->findOrFail($id);

        return Inertia::render('Admin/Orders/Edit', [
            'order' => $order,
            'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone', 'email']),
            'products' => Product::with(['variants:id,product_id,name,price,stock'])
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'price', 'stock']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id, AffiliateService $affiliateService)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'invoice_discount' => 'nullable|numeric|min:0',
            'shipping_charges' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded',
            'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
            'payment_method' => 'nullable|string|max:100',
            'payment_date' => 'nullable|date',
            'shipping_method' => 'nullable|string|max:100',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'order_note' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Update order
            $order->update([
                'customer_id' => $validated['customer_id'],
                'invoice_discount' => $validated['invoice_discount'] ?? 0,
                'shipping_charges' => $validated['shipping_charges'] ?? 0,
                'tax' => $validated['tax'] ?? 0,
                'status' => $validated['status'],
                'payment_status' => $validated['payment_status'],
                'payment_method' => $validated['payment_method'] ?? null,
                'payment_date' => $validated['payment_date'] ?? null,
                'shipping_method' => $validated['shipping_method'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
                'billing_address' => $validated['billing_address'] ?? null,
                'order_note' => $validated['order_note'] ?? null,
            ]);

            // Delete old items
            $order->items()->delete();

            // Create new items
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                $variant = isset($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                $subtotal = ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);

                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $subtotal,
                    'meta' => [
                        'product_name' => $product->name,
                        'sku' => $product->sku,
                        'variant_name' => $variant?->name ?? null,
                    ],
                ]);
            }

            // Recalculate totals
            $order->calculateTotals();

            $affiliateService->updateReferral($order);

            DB::commit();
            return to_route('admin.orders.index')->with('success', 'Order successfully updated!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update order: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            Order::destroy($id);
            
            return redirect()->route('orders.index')
                ->with('success', 'Order successfully deleted!');
                
        } catch (\Exception $e) {
            return redirect()->route('orders.index')
                ->with('error', 'Failed to delete order: ' . $e->getMessage());
        }
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, string $id, AffiliateService $affiliateService)
    {
        $order = Order::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded',
        ]);

        $order->update(['status' => $validated['status']]);

        // Safety Fix: Fresh data reload karein taake service ko sahi status mile
        $order = $order->fresh(); 

        // Ye check karega ke agar delivered hai to balance barhaye, cancelled hai to reject kare
        $affiliateService->finalizeCommission($order);

        return back()->with('success', 'Order status updated successfully!');
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, string $id)
    {
        $order = Order::findOrFail($id);
        
        $validated = $request->validate([
            'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
            'payment_date' => 'nullable|date',
        ]);

        $order->update([
            'payment_status' => $validated['payment_status'],
            'payment_date' => $validated['payment_date'] ?? now(),
        ]);

        return back()->with('success', 'Payment status updated successfully!');
    }
}