<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Vendor;
use Yajra\DataTables\Facades\DataTables;

class ProductController extends Controller
{
    public function __construct()
    {
        // Backend mein permissions check karein
        $this->middleware('permission:create.products')->only(['create', 'store']);
        $this->middleware('permission:edit.products')->only(['edit', 'update']);
        $this->middleware('permission:delete.products')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
   public function index(Request $request)
    {
        return Inertia::render('Admin/Products/Index', [
            'userRole' => $request->user()->role ?? 'admin',
        ]);
    }

    /**
     * Get DataTable data - API endpoint for DataTableWrapper
     */
    public function getData(Request $request)
    {
        $query = Product::with(['category', 'vendor'])->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('price', 'like', "%{$search}%")
                      ->orWhereHas('category', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('vendor', function($q) use ($search) {
                          $q->where('shop_name', 'like', "%{$search}%");
                      });
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('sku', 'like', "%{$search}%")
                          ->orWhere('price', 'like', "%{$search}%")
                          ->orWhereHas('category', function($q) use ($search) {
                              $q->where('name', 'like', "%{$search}%");
                          })
                          ->orWhereHas('vendor', function($q) use ($search) {
                              $q->where('shop_name', 'like', "%{$search}%");
                          });
                    });
                }
            }
        }
        
        // Additional filters
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status === 'active');
        }
        
        if ($request->has('category_id') && $request->category_id !== '') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('vendor_id') && $request->vendor_id !== '') {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('featured') && $request->featured !== '') {
            $query->where('featured', $request->featured === 'yes');
        }

        return DataTables::of($query)
            ->addColumn('category_name', function($product) {
                return $product->category ? $product->category->name : null;
            })
            ->addColumn('vendor_name', function($product) {
                return $product->vendor ? $product->vendor->shop_name : null;
            })
            ->addColumn('status_text', function($product) {
                return $product->status ? 'Active' : 'Inactive';
            })
            ->addColumn('featured_text', function($product) {
                return $product->featured ? 'Yes' : 'No';
            })
            ->make(true);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::all(['id', 'name']),
            'vendors' => Vendor::all(['id', 'shop_name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'short_description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|unique:products,sku',
            'thumbnail' => 'nullable|string',
            'status' => 'boolean',
            'featured' => 'boolean',
        ]);

        // Slug generate karein
        $validated['slug'] = str()->slug($validated['name']);

        Product::create($validated);

        return to_route('Products.index')->with('success', 'Product successfully created!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::with(['category', 'vendor', 'variants'])->findOrFail($id);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the existing resource.
     */
    public function edit(string $id)
    {
        $product = Product::findOrFail($id);

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => Category::all(['id', 'name']),
            'vendors' => Vendor::all(['id', 'shop_name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'short_description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|unique:products,sku,' . $id,
            'thumbnail' => 'nullable|string',
            'status' => 'boolean',
            'featured' => 'boolean',
        ]);

        // Slug update karein agar name change ho gaya
        if ($validated['name'] !== $product->name) {
            $validated['slug'] = str()->slug($validated['name']);
        }

        $product->update($validated);

        return to_route('Products.index')->with('success', 'Product successfully updated!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Product::destroy($id);
        
        return to_route('Products.index')->with('success', 'Product successfully deleted!');
    }
}
