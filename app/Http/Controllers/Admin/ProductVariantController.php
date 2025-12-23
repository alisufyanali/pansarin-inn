<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ProductVariant;
use App\Models\Product;
use App\Models\Attribute;
use Yajra\DataTables\Facades\DataTables;

class ProductVariantController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:create.variants')->only(['create', 'store']);
        $this->middleware('permission:edit.variants')->only(['edit', 'update']);
        $this->middleware('permission:delete.variants')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Inertia::render('Admin/Variants/Index', [
            'userRole' => $request->user()->role ?? 'admin',
        ]);
    }

    /**
     * Get DataTable data - API endpoint for DataTableWrapper
     */
    public function getData(Request $request)
    {
        $query = ProductVariant::with('product')->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('sku', 'like', "%{$search}%")
                      ->orWhere('price', 'like', "%{$search}%")
                      ->orWhere('stock', 'like', "%{$search}%")
                      ->orWhereHas('product', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('sku', 'like', "%{$search}%")
                          ->orWhere('price', 'like', "%{$search}%")
                          ->orWhere('stock', 'like', "%{$search}%")
                          ->orWhereHas('product', function($q) use ($search) {
                              $q->where('name', 'like', "%{$search}%");
                          });
                    });
                }
            }
        }
        
        // Additional filters
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status === 'active');
        }
        
        if ($request->has('product_id') && $request->product_id !== '') {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('is_default') && $request->is_default !== '') {
            $query->where('is_default', $request->is_default === 'yes');
        }

        if ($request->has('stock_status') && $request->stock_status !== '') {
            if ($request->stock_status === 'in_stock') {
                $query->where('stock', '>', 0);
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            }
        }

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
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Variants/Create', [
            'products' => Product::all(['id', 'name', 'price']),
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'product_id' => 'required|exists:products,id',
        'sku' => 'required|string|unique:product_variants,sku',
        'price' => 'required|numeric|min:0',
        'stock' => 'required|integer|min:0',
        'is_default' => 'boolean',
        'status' => 'boolean',
        'attributes' => 'nullable|string', // Changed to string since we're sending JSON
    ]);

    // Ensure attributes is stored as JSON string
    if (isset($validated['attributes']) && is_array($validated['attributes'])) {
        $validated['attributes'] = json_encode($validated['attributes']);
    }

    ProductVariant::create($validated);

    return to_route('product-variants.index')->with('success', 'Variant successfully created!');
}

public function update(Request $request, string $id)
{
    $variant = ProductVariant::findOrFail($id);

    $validated = $request->validate([
        'product_id' => 'required|exists:products,id',
        'sku' => 'required|string|unique:product_variants,sku,' . $id,
        'price' => 'required|numeric|min:0',
        'stock' => 'required|integer|min:0',
        'is_default' => 'boolean',
        'status' => 'boolean',
        'attributes' => 'nullable|string', // Changed to string
    ]);

    // Ensure attributes is stored as JSON string
    if (isset($validated['attributes']) && is_array($validated['attributes'])) {
        $validated['attributes'] = json_encode($validated['attributes']);
    }

    $variant->update($validated);

    return to_route('product-variants.index')->with('success', 'Variant successfully updated!');
}

public function edit(string $id)
{
    $variant = ProductVariant::findOrFail($id);
    
    // Parse attributes if they're stored as JSON string
    if ($variant->attributes && is_string($variant->attributes)) {
        $variant->attributes = json_decode($variant->attributes, true);
    }

    return Inertia::render('Admin/Variants/Edit', [
        'variant' => $variant,
        'products' => Product::all(['id', 'name', 'price']),
        'attributes' => Attribute::with('values')->get(),
    ]);
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $variant = ProductVariant::with('product')->findOrFail($id);

        return Inertia::render('Admin/Variants/Show', [
            'variant' => $variant
        ]);
    }

    /**
     * Show the form for editing the existing resource.
     */
   

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            ProductVariant::destroy($id);
            
            return redirect()->route('product-variants.index')
                ->with('success', 'Variant successfully deleted!');
                
        } catch (\Exception $e) {
            return redirect()->route('product-variants.index')
                ->with('error', 'Failed to delete variant: ' . $e->getMessage());
        }
    }
}