<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\CouponRepository;
use App\Http\Requests\Admin\CouponRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CouponController extends Controller
{
    protected $couponRepository;

    public function __construct(CouponRepository $couponRepository)
    {
        $this->couponRepository = $couponRepository;
        $this->middleware('permission:create.coupons')->only(['create', 'store']);
        $this->middleware('permission:edit.coupons')->only(['edit', 'update']);
        $this->middleware('permission:delete.coupons')->only(['destroy']);
        $this->middleware('permission:view.coupons')->only(['index', 'show', 'getData']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $stats = $this->couponRepository->getStats();

            return Inertia::render('Admin/Coupons/Index', [
                'userRole' => $request->user()->role ?? 'admin',
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Coupon index error: '.$e->getMessage());

            return back()->with('error', 'Failed to load coupons.');
        }
    }

    /**
     * Get DataTable data
     */
    public function getData(Request $request)
    {
        try {
            return $this->couponRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Coupon getData error: '.$e->getMessage());

            return response()->json([
                'error' => 'Failed to load data',
                'message' => $e->getMessage(),
                'data' => [],
                'total' => 0,
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            return Inertia::render('Admin/Coupons/Create', [
                'products' => Product::orderBy('name')->get(['id', 'name']),
                'categories' => Category::orderBy('name')->get(['id', 'name']),
            ]);
        } catch (\Exception $e) {
            Log::error('Coupon create error: '.$e->getMessage());

            return redirect()->route('admin.coupons.index')
                ->with('error', 'Failed to load create form.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CouponRequest $request)
    {
        try {
            $validated = $request->validated();

            $this->couponRepository->store($validated);

            return to_route('admin.coupons.index')->with('success', 'Coupon successfully created!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Coupon creation error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to create coupon.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $coupon = $this->couponRepository->find($id);

            return Inertia::render('Admin/Coupons/Show', [
                'coupon' => $coupon,
            ]);
        } catch (\Exception $e) {
            Log::error('Coupon show error: '.$e->getMessage());

            return redirect()->route('admin.coupons.index')
                ->with('error', 'Failed to load coupon.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $coupon = $this->couponRepository->find($id);

            return Inertia::render('Admin/Coupons/Edit', [
                'coupon' => $coupon,
                'products' => Product::orderBy('name')->get(['id', 'name']),
                'categories' => Category::orderBy('name')->get(['id', 'name']),
            ]);
        } catch (\Exception $e) {
            Log::error('Coupon edit error: '.$e->getMessage());

            return redirect()->route('admin.coupons.index')
                ->with('error', 'Failed to load coupon.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CouponRequest $request, string $id)
    {
        try {
            $validated = $request->validated();

            $this->couponRepository->update($id, $validated);

            return to_route('admin.coupons.index')->with('success', 'Coupon successfully updated!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Coupon update error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to update coupon.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->couponRepository->delete($id);

            return redirect()->route('admin.coupons.index')
                ->with('success', 'Coupon successfully deleted!');
        } catch (\Exception $e) {
            Log::error('Coupon deletion error: '.$e->getMessage());

            return redirect()->route('admin.coupons.index')
                ->with('error', 'Failed to delete coupon.');
        }
    }

    /**
     * Toggle coupon active status
     */
    public function toggleStatus(string $id)
    {
        try {
            $this->couponRepository->toggleStatus($id);

            return back()->with('success', 'Coupon status updated successfully!');
        } catch (\Exception $e) {
            Log::error('Coupon toggle status error: '.$e->getMessage());

            return back()->with('error', 'Failed to update coupon status.');
        }
    }

    /**
     * Bulk delete coupons
     */
    public function bulkDelete(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:coupons,id',
            ]);

            $count = $this->couponRepository->bulkDelete($request->ids);

            return back()->with('success', $count.' coupons deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Coupon bulk delete error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete coupons.');
        }
    }
}
