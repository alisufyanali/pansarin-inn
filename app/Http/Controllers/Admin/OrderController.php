<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\OrderRepository;
use App\Http\Requests\Admin\OrderRequest;
use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderWhatsAppNotification;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Services\AffiliateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class OrderController extends Controller
{
    protected $orderRepository;

    public function __construct(OrderRepository $orderRepository)
    {
        $this->orderRepository = $orderRepository;
        $this->middleware('permission:create.orders')->only(['create', 'store']);
        $this->middleware('permission:edit.orders')->only(['edit', 'update']);
        $this->middleware('permission:delete.orders')->only(['destroy']);
        $this->middleware('permission:view.orders')->only(['index', 'show', 'getData']);
    }

    public function index(Request $request)
    {
        try {
            $stats = $this->orderRepository->getStats();

            return Inertia::render('Admin/Orders/Index', [
                'userRole' => $request->user()->role ?? 'admin',
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load orders index: '.$e->getMessage());

            return back()->with('error', 'Failed to load orders');
        }
    }

    public function getData(Request $request)
    {
        try {
            $query = $this->orderRepository->getAllForDataTable($request);

            return DataTables::of($query)
                ->addColumn('customer_name', function ($order) {
                    return $order->customer ? $order->customer->full_name : null;
                })
                ->make(true);
        } catch (\Exception $e) {
            Log::error('Failed to get orders data: '.$e->getMessage());

            return response()->json(['error' => 'Failed to load data'], 500);
        }
    }

    public function create()
    {
        try {
            return Inertia::render('Admin/Orders/Create', [
                'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone', 'email']),
                'products' => Product::with(['variants:id,product_id,name,price,stock'])
                    ->where('status', 'active')
                    ->orderBy('name')
                    ->get(['id', 'name', 'sku', 'price', 'stock']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load order create form: '.$e->getMessage());

            return back()->with('error', 'Failed to load form');
        }
    }

    public function store(OrderRequest $request, AffiliateService $affiliateService)
    {
        try {
            $order = $this->orderRepository->store($request->validated());

            // Dispatch email job
            SendOrderConfirmationEmail::dispatch($order);

            // Send WhatsApp notification
            SendOrderWhatsAppNotification::dispatch($order);

            return to_route('admin.orders.index')
                ->with('success', 'Order successfully created! Confirmation email will be sent shortly.');
        } catch (\Exception $e) {
            Log::error('Failed to create order: '.$e->getMessage());

            return back()->with('error', 'Failed to create order: '.$e->getMessage());
        }
    }

    public function show(string $id)
    {
        try {
            $order = $this->orderRepository->find($id);

            return Inertia::render('Admin/Orders/Show', [
                'order' => $order,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load order: '.$e->getMessage());

            return back()->with('error', 'Order not found');
        }
    }

    public function edit(string $id)
    {
        try {
            $order = $this->orderRepository->find($id);

            return Inertia::render('Admin/Orders/Edit', [
                'order' => $order,
                'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone', 'email']),
                'products' => Product::with(['variants:id,product_id,name,price,stock'])
                    ->where('status', 'active')
                    ->orderBy('name')
                    ->get(['id', 'name', 'sku', 'price', 'stock']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load order edit form: '.$e->getMessage());

            return back()->with('error', 'Failed to load order');
        }
    }

    public function update(OrderRequest $request, string $id, AffiliateService $affiliateService)
    {
        try {
            $order = $this->orderRepository->update($id, $request->validated());

            $affiliateService->updateReferral($order);

            return to_route('admin.orders.index')
                ->with('success', 'Order successfully updated!');
        } catch (\Exception $e) {
            Log::error('Failed to update order: '.$e->getMessage());

            return back()->with('error', 'Failed to update order: '.$e->getMessage());
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->orderRepository->delete($id);

            return redirect()->route('admin.orders.index')
                ->with('success', 'Order successfully deleted!');

        } catch (\Exception $e) {
            Log::error('Failed to delete order: '.$e->getMessage());

            return redirect()->route('admin.orders.index')
                ->with('error', 'Failed to delete order: '.$e->getMessage());
        }
    }

    public function updateStatus(Request $request, string $id, AffiliateService $affiliateService)
    {
        try {
        $order = $this->orderRepository->update($id, $request->validated());
        $affiliateService->updateReferral($order);

        return to_route('admin.orders.index')
            ->with('success', 'Order successfully updated and commission processed!');
            
        } catch (\Exception $e) {
            Log::error('Failed to update order: '.$e->getMessage());
            return back()->with('error', 'Failed to update order: '.$e->getMessage());
        }
    }

    public function updatePaymentStatus(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
                'payment_date' => 'nullable|date',
            ]);

            $this->orderRepository->updatePaymentStatus($id, $validated);

            return back()->with('success', 'Payment status updated successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to update payment status: '.$e->getMessage());

            return back()->with('error', 'Failed to update payment status: '.$e->getMessage());
        }
    }
}
