<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ProductVariant;
use App\Models\Product;
use App\Models\Attribute;
use Yajra\DataTables\Facades\DataTables;
use App\Http\Repositories\Admin\ProductVariantRepository;
use App\Http\Requests\Admin\ProductVariantRequest;
use Illuminate\Support\Facades\Log;

class ProductVariantController extends Controller
{
    protected $variantRepository;

    public function __construct(ProductVariantRepository $variantRepository)
    {
        $this->variantRepository = $variantRepository;
        $this->middleware('permission:create.variants')->only(['create', 'store']);
        $this->middleware('permission:edit.variants')->only(['edit', 'update']);
        $this->middleware('permission:delete.variants')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $stats = $this->variantRepository->getStats();

            return Inertia::render('Admin/Variants/Index', [
                'userRole' => $request->user()->role ?? 'admin',
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load variants index: ' . $e->getMessage());
            return back()->with('error', 'Failed to load variants');
        }
    }

    /**
     * Get DataTable data - API endpoint for DataTableWrapper
     */
    public function getData(Request $request)
    {
        try {
            $query = $this->variantRepository->getAllForDataTable($request);

            return DataTables::of($query)
                ->addColumn('product_name', function($variant) {
                    return $variant->product ? $variant->product->name : null;
                })
                ->addColumn('status_text', function($variant) {
                    return $variant->status ? 'Active' : 'Inactive';
                })
                ->addColumn('is_default_text', function($variant) {
                    return $variant->is_default ? 'Yes' : 'No';
                })
                ->addColumn('stock_status', function($variant) {
                    return $variant->stock > 0 ? 'In Stock' : 'Out of Stock';
                })
                ->make(true);
        } catch (\Exception $e) {
            Log::error('Failed to get variants data: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load data'], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            return Inertia::render('Admin/Variants/Create', [
                'products' => Product::all(['id', 'name', 'price']),
                'attributes' => Attribute::with('values')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load variant create form: ' . $e->getMessage());
            return back()->with('error', 'Failed to load form');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductVariantRequest $request)
    {
        try {
            $this->variantRepository->store($request->validated());

            return to_route('admin.product-variants.index')
                ->with('success', 'Variant successfully created!');
        } catch (\Exception $e) {
            Log::error('Failed to create variant: ' . $e->getMessage());
            return back()->with('error', 'Failed to create variant: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $variant = $this->variantRepository->find($id);

            return Inertia::render('Admin/Variants/Show', [
                'variant' => $variant
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load variant: ' . $e->getMessage());
            return back()->with('error', 'Variant not found');
        }
    }

    /**
     * Show the form for editing the existing resource.
     */
    public function edit(string $id)
    {
        try {
            $variant = $this->variantRepository->find($id);
            
            // Parse attributes if they're stored as JSON string
            if ($variant->attributes && is_string($variant->attributes)) {
                $variant->attributes = json_decode($variant->attributes, true);
            }

            return Inertia::render('Admin/Variants/Edit', [
                'variant' => $variant,
                'products' => Product::all(['id', 'name', 'price']),
                'attributes' => Attribute::with('values')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load variant edit form: ' . $e->getMessage());
            return back()->with('error', 'Failed to load variant');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductVariantRequest $request, string $id)
    {
        try {
            $this->variantRepository->update($id, $request->validated());

            return to_route('admin.product-variants.index')
                ->with('success', 'Variant successfully updated!');
        } catch (\Exception $e) {
            Log::error('Failed to update variant: ' . $e->getMessage());
            return back()->with('error', 'Failed to update variant: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->variantRepository->delete($id);
            
            return redirect()->route('admin.product-variants.index')
                ->with('success', 'Variant successfully deleted!');
                
        } catch (\Exception $e) {
            Log::error('Failed to delete variant: ' . $e->getMessage());
            return redirect()->route('admin.product-variants.index')
                ->with('error', 'Failed to delete variant: ' . $e->getMessage());
        }
    }
}