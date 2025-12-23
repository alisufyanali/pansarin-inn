<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Attribute;
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
    $stats = [
        'total' => Product::count(),
        'active' => Product::where('status', true)->count(),
        'featured' => Product::where('featured', true)->count(),
        'onSale' => Product::whereNotNull('sale_price')->where('sale_price', '>', 0)->count(),
    ];

    return Inertia::render('Admin/Products/Index', [
        'userRole' => $request->user()->role ?? 'admin',
        'stats' => $stats, // Add stats here
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
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    try {
        // Fix: tags ko array me convert karo agar string hai
        if ($request->has('tags') && is_string($request->tags)) {
            $request->merge([
                'tags' => collect(explode(',', $request->tags))
                    ->map(fn($tag) => trim($tag))
                    ->filter()
                    ->values()
                    ->toArray()
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            
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

        // ...existing code...
        if (empty($validated['slug'])) {
            $validated['slug'] = str()->slug($validated['name']);
        }
        if (empty($validated['sku'])) {
            $lastProduct = Product::latest('id')->first();
            $nextNumber = ($lastProduct?->id ?? 0) + 1;
            $validated['sku'] = 'PROD-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
        }
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




