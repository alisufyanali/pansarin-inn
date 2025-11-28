<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Vendor;

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
    public function index()
    {
        $products = Product::with(['category', 'vendor'])->get();
        
        return Inertia::render('Admin/Products/Index', [
            'products' => $products
        ]); 
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
