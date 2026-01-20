<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Sale;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariant;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\DB;
use App\Jobs\SendSaleConfirmationEmail;
use App\Jobs\SendSaleWhatsAppNotification;

class SaleController extends Controller
{
    public function __construct()
    {
        // $this->middleware('permission:create.sales')->only(['create', 'store']);
        // $this->middleware('permission:edit.sales')->only(['edit', 'update']);
        // $this->middleware('permission:delete.sales')->only(['destroy']);
        // $this->middleware('permission:view.sales')->only(['index', 'show', 'getData']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Calculate stats
        $stats = [
            'total' => Sale::count(),
            'pending' => Sale::where('delivery_status', 'pending')->count(),
            'processing' => Sale::where('delivery_status', 'processing')->count(),
            'delivered' => Sale::where('delivery_status', 'delivered')->count(),
            'totalRevenue' => Sale::where('payment_status', 'paid')->sum('grand_total'),
        ];

        return Inertia::render('Admin/Sales/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }

    /**
     * Get DataTable data
     */
    public function getData(Request $request)
    {
        $query = Sale::with(['customer', 'order'])->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('sale_code', 'like', "%{$search}%")
                      ->orWhere('delivery_status', 'like', "%{$search}%")
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
                        $q->where('sale_code', 'like', "%{$search}%")
                          ->orWhere('delivery_status', 'like', "%{$search}%")
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
        if ($request->has('delivery_status') && $request->delivery_status !== '') {
            $query->where('delivery_status', $request->delivery_status);
        }
        
        if ($request->has('payment_status') && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }

        return DataTables::of($query)
            ->addColumn('customer_name', function($sale) {
                return $sale->customer ? $sale->customer->full_name : null;
            })
            ->make(true);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Sales/Create', [
            'orders' => Order::with(['customer'])
                ->whereDoesntHave('sale') // Only orders without sales
                ->where('status', 'delivered') // Only delivered orders
                ->orderBy('id', 'desc')
                ->get(['id', 'order_number', 'customer_id', 'grand_total']),
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'invoice_discount' => 'nullable|numeric|min:0',
            'vat' => 'nullable|numeric|min:0',
            'vat_percent' => 'nullable|string',
            'shipping_charges' => 'nullable|numeric|min:0',
            'delivery_status' => 'required|in:pending,processing,shipped,delivered,cancelled,returned',
            'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
            'payment_type' => 'nullable|string|max:100',
            'payment_timestamp' => 'nullable|date',
            'shipping_method' => 'nullable|string|max:100',
            'shipping_address' => 'nullable|string',
            'shipping_response' => 'nullable|string',
            'delivery_datetime' => 'nullable|date',
            'remarks' => 'nullable|string',
            'review' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Get order
            $order = Order::findOrFail($validated['order_id']);

            // Create sale
            $sale = Sale::create([
                'order_id' => $validated['order_id'],
                'customer_id' => $validated['customer_id'],
                'sale_code' => Sale::generateSaleCode($order->order_number),
                'invoice_discount' => $validated['invoice_discount'] ?? 0,
                'vat' => $validated['vat'] ?? 0,
                'vat_percent' => $validated['vat_percent'] ?? null,
                'shipping_charges' => $validated['shipping_charges'] ?? 0,
                'delivery_status' => $validated['delivery_status'],
                'payment_status' => $validated['payment_status'],
                'payment_type' => $validated['payment_type'] ?? null,
                'payment_timestamp' => $validated['payment_timestamp'] ?? null,
                'shipping_method' => $validated['shipping_method'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
                'shipping_response' => $validated['shipping_response'] ?? null,
                'delivery_datetime' => $validated['delivery_datetime'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'review' => $validated['review'] ?? null,
                'sale_datetime' => now(),
                'is_active' => true,
            ]);

            // Create sale items
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                $variant = isset($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                $subtotal = ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);

                $sale->items()->create([
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
            $sale->calculateTotals();

            // Dispatch email job
            SendSaleConfirmationEmail::dispatch($sale);

            // Send WhatsApp notification
            SendSaleWhatsAppNotification::dispatch($sale);

            DB::commit();
            return to_route('admin.sales.index')->with('success', 'Sale successfully created! Confirmation email and WhatsApp notification will be sent shortly.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create sale: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $sale = Sale::with(['customer', 'order', 'items.product', 'items.variant'])->findOrFail($id);

        return Inertia::render('Admin/Sales/Show', [
            'sale' => $sale
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $sale = Sale::with(['customer', 'order', 'items.product', 'items.variant'])->findOrFail($id);

        return Inertia::render('Admin/Sales/Edit', [
            'sale' => $sale,
            'orders' => Order::with(['customer'])
                ->orderBy('id', 'desc')
                ->get(['id', 'order_number', 'customer_id', 'grand_total']),
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
    public function update(Request $request, string $id)
    {
        $sale = Sale::findOrFail($id);

        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'invoice_discount' => 'nullable|numeric|min:0',
            'vat' => 'nullable|numeric|min:0',
            'vat_percent' => 'nullable|string',
            'shipping_charges' => 'nullable|numeric|min:0',
            'delivery_status' => 'required|in:pending,processing,shipped,delivered,cancelled,returned',
            'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
            'payment_type' => 'nullable|string|max:100',
            'payment_timestamp' => 'nullable|date',
            'shipping_method' => 'nullable|string|max:100',
            'shipping_address' => 'nullable|string',
            'shipping_response' => 'nullable|string',
            'delivery_datetime' => 'nullable|date',
            'remarks' => 'nullable|string',
            'review' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Update sale
            $sale->update([
                'order_id' => $validated['order_id'],
                'customer_id' => $validated['customer_id'],
                'invoice_discount' => $validated['invoice_discount'] ?? 0,
                'vat' => $validated['vat'] ?? 0,
                'vat_percent' => $validated['vat_percent'] ?? null,
                'shipping_charges' => $validated['shipping_charges'] ?? 0,
                'delivery_status' => $validated['delivery_status'],
                'payment_status' => $validated['payment_status'],
                'payment_type' => $validated['payment_type'] ?? null,
                'payment_timestamp' => $validated['payment_timestamp'] ?? null,
                'shipping_method' => $validated['shipping_method'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
                'shipping_response' => $validated['shipping_response'] ?? null,
                'delivery_datetime' => $validated['delivery_datetime'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'review' => $validated['review'] ?? null,
            ]);

            // Delete old items
            $sale->items()->delete();

            // Create new items
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                $variant = isset($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                $subtotal = ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);

                $sale->items()->create([
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
            $sale->calculateTotals();

            DB::commit();
            return to_route('admin.sales.index')->with('success', 'Sale successfully updated!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update sale: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            Sale::destroy($id);
            
            return redirect()->route('admin.sales.index')
                ->with('success', 'Sale successfully deleted!');
                
        } catch (\Exception $e) {
            return redirect()->route('admin.sales.index')
                ->with('error', 'Failed to delete sale: ' . $e->getMessage());
        }
    }

    /**
     * Update delivery status
     */
    public function updateDeliveryStatus(Request $request, string $id)
    {
        $sale = Sale::findOrFail($id);
        
        $validated = $request->validate([
            'delivery_status' => 'required|in:pending,processing,shipped,delivered,cancelled,returned',
            'delivery_datetime' => 'nullable|date',
        ]);

        $sale->update([
            'delivery_status' => $validated['delivery_status'],
            'delivery_datetime' => $validated['delivery_datetime'] ?? now(),
        ]);

        return back()->with('success', 'Delivery status updated successfully!');
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, string $id)
    {
        $sale = Sale::findOrFail($id);
        
        $validated = $request->validate([
            'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
            'payment_timestamp' => 'nullable|date',
        ]);

        $sale->update([
            'payment_status' => $validated['payment_status'],
            'payment_timestamp' => $validated['payment_timestamp'] ?? now(),
        ]);

        return back()->with('success', 'Payment status updated successfully!');
    }
}