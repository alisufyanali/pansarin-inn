<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\SaleRepository;
use App\Http\Requests\Admin\SaleRequest;
use App\Jobs\SendSaleConfirmationEmail;
use App\Jobs\SendSaleWhatsAppNotification;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SaleController extends Controller
{
    protected $saleRepository;

    public function __construct(SaleRepository $saleRepository)
    {
        $this->saleRepository = $saleRepository;
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
        try {
            $stats = $this->saleRepository->getStats();

            return Inertia::render('Admin/Sales/Index', [
                'userRole' => $request->user()->role ?? 'admin',
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load sales index: '.$e->getMessage());

            return back()->with('error', 'Failed to load sales');
        }
    }

    /**
     * Get DataTable data
     */
    public function getData(Request $request)
    {
        try {
            $query = $this->saleRepository->getAllForDataTable($request);

            return DataTables::of($query)
                ->addColumn('customer_name', function ($sale) {
                    return $sale->customer ? $sale->customer->full_name : null;
                })
                ->make(true);
        } catch (\Exception $e) {
            Log::error('Failed to get sales data: '.$e->getMessage());

            return response()->json(['error' => 'Failed to load data'], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
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
        } catch (\Exception $e) {
            Log::error('Failed to load sale create form: '.$e->getMessage());

            return back()->with('error', 'Failed to load form');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SaleRequest $request)
    {
        try {
            $sale = $this->saleRepository->store($request->validated());

            // Dispatch email job
            SendSaleConfirmationEmail::dispatch($sale);

            // Send WhatsApp notification
            SendSaleWhatsAppNotification::dispatch($sale);

            return to_route('admin.sales.index')
                ->with('success', 'Sale successfully created! Confirmation email and WhatsApp notification will be sent shortly.');
        } catch (\Exception $e) {
            Log::error('Failed to create sale: '.$e->getMessage());

            return back()->with('error', 'Failed to create sale: '.$e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $sale = $this->saleRepository->find($id);

            return Inertia::render('Admin/Sales/Show', [
                'sale' => $sale,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load sale: '.$e->getMessage());

            return back()->with('error', 'Sale not found');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $sale = $this->saleRepository->find($id);

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
        } catch (\Exception $e) {
            Log::error('Failed to load sale edit form: '.$e->getMessage());

            return back()->with('error', 'Failed to load sale');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SaleRequest $request, string $id)
    {
        try {
            $this->saleRepository->update($id, $request->validated());

            return to_route('admin.sales.index')
                ->with('success', 'Sale successfully updated!');
        } catch (\Exception $e) {
            Log::error('Failed to update sale: '.$e->getMessage());

            return back()->with('error', 'Failed to update sale: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->saleRepository->delete($id);

            return redirect()->route('admin.sales.index')
                ->with('success', 'Sale successfully deleted!');

        } catch (\Exception $e) {
            Log::error('Failed to delete sale: '.$e->getMessage());

            return redirect()->route('admin.sales.index')
                ->with('error', 'Failed to delete sale: '.$e->getMessage());
        }
    }

    /**
     * Update delivery status
     */
    public function updateDeliveryStatus(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'delivery_status' => 'required|in:pending,processing,shipped,delivered,cancelled,returned',
                'delivery_datetime' => 'nullable|date',
            ]);

            $this->saleRepository->updateDeliveryStatus($id, $validated);

            return back()->with('success', 'Delivery status updated successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to update delivery status: '.$e->getMessage());

            return back()->with('error', 'Failed to update delivery status: '.$e->getMessage());
        }
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
                'payment_timestamp' => 'nullable|date',
            ]);

            $this->saleRepository->updatePaymentStatus($id, $validated);

            return back()->with('success', 'Payment status updated successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to update payment status: '.$e->getMessage());

            return back()->with('error', 'Failed to update payment status: '.$e->getMessage());
        }
    }
}
