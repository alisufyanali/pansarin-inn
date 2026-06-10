<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\OrderReviewRepository;
use App\Http\Requests\Admin\OrderReviewRequest;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrderReviewController extends Controller
{
    public function __construct(protected OrderReviewRepository $repo)
    {
        $this->middleware('permission:view.order-reviews')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.order-reviews')->only(['create', 'store']);
        $this->middleware('permission:edit.order-reviews')->only(['edit', 'update', 'updateStatus']);
        $this->middleware('permission:delete.order-reviews')->only(['destroy']);
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/OrderReviews/Index', [
            'stats' => $this->repo->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        try {
            return $this->repo->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('OrderReview getData: '.$e->getMessage());
            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
        }
    }

    public function create()
    {
        return Inertia::render('Admin/OrderReviews/Create', [
            'orders'    => Order::with('customer')->latest()->get(['id', 'order_number', 'customer_id']),
            'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone']),
        ]);
    }

    public function store(OrderReviewRequest $request)
    {
        try {
            $this->repo->store($request->validated());
            return to_route('admin.order-reviews.index')->with('success', 'Review added successfully!');
        } catch (\Exception $e) {
            Log::error('OrderReview store: '.$e->getMessage());
            return back()->withInput()->with('error', 'Failed to add review.');
        }
    }

    public function show(string $id)
    {
        try {
            return Inertia::render('Admin/OrderReviews/Show', [
                'review' => $this->repo->find($id),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.order-reviews.index')->with('error', 'Review not found.');
        }
    }

    public function edit(string $id)
    {
        try {
            return Inertia::render('Admin/OrderReviews/Edit', [
                'review'    => $this->repo->find($id),
                'orders'    => Order::with('customer')->latest()->get(['id', 'order_number', 'customer_id']),
                'customers' => Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone']),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.order-reviews.index')->with('error', 'Review not found.');
        }
    }

    public function update(OrderReviewRequest $request, string $id)
    {
        try {
            $this->repo->update($id, $request->validated());
            return to_route('admin.order-reviews.index')->with('success', 'Review updated successfully!');
        } catch (\Exception $e) {
            Log::error('OrderReview update: '.$e->getMessage());
            return back()->withInput()->with('error', 'Failed to update review.');
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->repo->delete($id);
            return redirect()->route('admin.order-reviews.index')->with('success', 'Review deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->route('admin.order-reviews.index')->with('error', 'Failed to delete review.');
        }
    }

    public function updateStatus(Request $request, string $id)
    {
        try {
            $request->validate(['status' => 'required|in:pending,approved,rejected']);
            $this->repo->updateStatus($id, $request->status);
            return back()->with('success', 'Status updated!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
