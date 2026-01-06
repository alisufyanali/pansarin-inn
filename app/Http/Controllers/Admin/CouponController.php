<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Category;
use Yajra\DataTables\Facades\DataTables;

class CouponController extends Controller
{
    public function __construct()
    {
        // $this->middleware('permission:create.coupons')->only(['create', 'store']);
        // $this->middleware('permission:edit.coupons')->only(['edit', 'update']);
        // $this->middleware('permission:delete.coupons')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Calculate stats
        $stats = [
            'total' => Coupon::count(),
            'active' => Coupon::where('is_active', true)->count(),
            'percentage' => Coupon::where('discount_type', 'percentage')->count(),
            'fixed' => Coupon::where('discount_type', 'fixed')->count(),
        ];

        return Inertia::render('Admin/Coupons/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }

    /**
     * Get DataTable data
     */
    public function getData(Request $request)
    {
        $query = Coupon::with(['product', 'category'])->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('discount_type', 'like', "%{$search}%")
                      ->orWhere('apply_to', 'like', "%{$search}%");
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('code', 'like', "%{$search}%")
                          ->orWhere('description', 'like', "%{$search}%")
                          ->orWhere('discount_type', 'like', "%{$search}%")
                          ->orWhere('apply_to', 'like', "%{$search}%");
                    });
                }
            }
        }
        
        // Filters
        if ($request->has('discount_type') && $request->discount_type !== '') {
            $query->where('discount_type', $request->discount_type);
        }
        
        if ($request->has('apply_to') && $request->apply_to !== '') {
            $query->where('apply_to', $request->apply_to);
        }

        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active);
        }

        return DataTables::of($query)
            ->addColumn('product_name', function($coupon) {
                return $coupon->product ? $coupon->product->name : null;
            })
            ->addColumn('category_name', function($coupon) {
                return $coupon->category ? $coupon->category->name : null;
            })
            ->make(true);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Coupons/Create', [
            'products' => Product::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'apply_to' => 'required|in:order,product,category',
            'product_id' => 'nullable|exists:products,id|required_if:apply_to,product',
            'category_id' => 'nullable|exists:categories,id|required_if:apply_to,category',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        // Clean up product_id and category_id based on apply_to
        if ($validated['apply_to'] !== 'product') {
            $validated['product_id'] = null;
        }
        if ($validated['apply_to'] !== 'category') {
            $validated['category_id'] = null;
        }

        Coupon::create($validated);

        return to_route('coupons.index')->with('success', 'Coupon successfully created!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $coupon = Coupon::with(['product', 'category'])->findOrFail($id);

        return Inertia::render('Admin/Coupons/Show', [
            'coupon' => $coupon
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $coupon = Coupon::with(['product', 'category'])->findOrFail($id);

        return Inertia::render('Admin/Coupons/Edit', [
            'coupon' => $coupon,
            'products' => Product::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $coupon = Coupon::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code,' . $id,
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'apply_to' => 'required|in:order,product,category',
            'product_id' => 'nullable|exists:products,id|required_if:apply_to,product',
            'category_id' => 'nullable|exists:categories,id|required_if:apply_to,category',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        // Clean up product_id and category_id based on apply_to
        if ($validated['apply_to'] !== 'product') {
            $validated['product_id'] = null;
        }
        if ($validated['apply_to'] !== 'category') {
            $validated['category_id'] = null;
        }

        $coupon->update($validated);

        return to_route('coupons.index')->with('success', 'Coupon successfully updated!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            Coupon::destroy($id);
            
            return redirect()->route('coupons.index')
                ->with('success', 'Coupon successfully deleted!');
                
        } catch (\Exception $e) {
            return redirect()->route('coupons.index')
                ->with('error', 'Failed to delete coupon: ' . $e->getMessage());
        }
    }

    /**
     * Toggle coupon active status
     */
    public function toggleStatus(string $id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->is_active = !$coupon->is_active;
        $coupon->save();

        return back()->with('success', 'Coupon status updated successfully!');
    }
}