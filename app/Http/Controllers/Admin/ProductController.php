<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Vendor;
use App\Models\Attribute;

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
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'sub_category_id' => 'nullable|exists:sub_categories,id',
                'short_description' => 'nullable|string',
                'long_description' => 'nullable|string',
                'urdu_name' => 'nullable|string',
                'scientific_name' => 'nullable|string',
                'alternative_name' => 'nullable|string',
                'other_name' => 'nullable|string',
                'slug' => 'nullable|string|unique:products,slug',
                'unit' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'sale_price' => 'nullable|numeric|min:0',
                'sku' => 'nullable|string|unique:products,sku',
                'barcode' => 'nullable|string',
                'stock_qty' => 'nullable|integer|min:0',
                'stock_alert' => 'nullable|integer|min:0',
                'status' => 'sometimes|boolean',
                'featured' => 'sometimes|boolean',
                'meta_title' => 'nullable|string|max:60',
                'meta_description' => 'nullable|string|max:160',
                'meta_keywords' => 'nullable|string',
                'tags' => 'nullable|array',
                'tags.*' => 'nullable|string',
                'schema_markup' => 'nullable|string',
                'social_description' => 'nullable|string|max:300',
                'thumbnail' => 'nullable|image|max:2048',
                'social_image' => 'nullable|image|max:2048',
                'gallery' => 'nullable',
            ]);

            // Generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = str()->slug($validated['name']);
            }

            // Auto-generate SKU if not provided
            if (empty($validated['sku'])) {
                $lastProduct = Product::latest('id')->first();
                $nextNumber = ($lastProduct?->id ?? 0) + 1;
                $validated['sku'] = 'PROD-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            }

            // Handle file uploads
            if ($request->hasFile('thumbnail')) {
                $validated['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
            }

            if ($request->hasFile('social_image')) {
                $validated['social_image'] = $request->file('social_image')->store('products', 'public');
            }

            if ($request->hasFile('gallery')) {
                $images = [];
                foreach ($request->file('gallery') as $img) {
                    $images[] = $img->store('products/gallery', 'public');
                }
                $validated['gallery'] = $images;
            }

            Product::create($validated);

            return to_route('products.index')->with('success', 'Product successfully created!');
        } catch (\Exception $e) {
            \Log::error('Product creation error: ' . $e->getMessage());
            throw $e;
        }
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
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $product = Product::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'sub_category_id' => 'nullable|exists:sub_categories,id',
                'short_description' => 'nullable|string',
                'long_description' => 'nullable|string',
                'urdu_name' => 'nullable|string',
                'scientific_name' => 'nullable|string',
                'alternative_name' => 'nullable|string',
                'other_name' => 'nullable|string',
                'slug' => 'nullable|string|unique:products,slug,' . $id,
                'unit' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'sale_price' => 'nullable|numeric|min:0',
                'sku' => 'nullable|string|unique:products,sku,' . $id,
                'barcode' => 'nullable|string',
                'stock_qty' => 'nullable|integer|min:0',
                'stock_alert' => 'nullable|integer|min:0',
                'status' => 'sometimes|boolean',
                'featured' => 'sometimes|boolean',
                'meta_title' => 'nullable|string|max:60',
                'meta_description' => 'nullable|string|max:160',
                'meta_keywords' => 'nullable|string',
                'tags' => 'nullable|array',
                'tags.*' => 'nullable|string',
                'schema_markup' => 'nullable|string',
                'social_description' => 'nullable|string|max:300',
                'thumbnail' => 'nullable|image|max:2048',
                'social_image' => 'nullable|image|max:2048',
                'gallery' => 'nullable',
            ]);

            // Update slug if name changed
            if ($validated['name'] !== $product->name) {
                $validated['slug'] = str()->slug($validated['name']);
            }

            // Handle file uploads
            if ($request->hasFile('thumbnail')) {
                $validated['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
            }

            if ($request->hasFile('social_image')) {
                $validated['social_image'] = $request->file('social_image')->store('products', 'public');
            }

            if ($request->hasFile('gallery')) {
                $images = [];
                foreach ($request->file('gallery') as $img) {
                    $images[] = $img->store('products/gallery', 'public');
                }
                $validated['gallery'] = $images;
            }

            $product->update($validated);

            return to_route('products.index')->with('success', 'Product successfully updated!');
        } catch (\Exception $e) {
            \Log::error('Product update error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Product::destroy($id);
        
        return to_route('products.index')->with('success', 'Product successfully deleted!');
    }
}