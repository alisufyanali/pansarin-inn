<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Attribute;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view.products')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.products')->only(['create', 'store']);
        $this->middleware('permission:edit.products')->only(['edit', 'update']);
        $this->middleware('permission:delete.products')->only(['destroy']);
    }

   public function index(Request $request)
    {
        $stats = [
            'total' => Product::count(),
            'active' => Product::where('status', true)->count(),
            'featured' => Product::where('featured', true)->count(),
            'onSale' => Product::whereNotNull('sale_price')
                ->whereColumn('sale_price', '<', 'price')
                ->where('sale_price', '>', 0)
                ->count(),
        ];

        return Inertia::render('Admin/Products/Index', [
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        try {
            $query = Product::query()
                ->with('category:id,name')
                ->select('id', 'name', 'sku', 'price', 'sale_price', 'purchase_price_per_unit', 'sale_price_per_unit', 'quantity', 'unit', 'status', 'featured', 'category_id', 'created_at', 'updated_at');
            
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhereHas('category', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            }
            
            if ($request->filled('status')) {
                $query->where('status', $request->status === 'active');
            }
            
            if ($request->filled('featured')) {
                $query->where('featured', $request->featured === 'yes');
            }

            $sortBy = $request->get('sortBy', 'created_at');
            $sortOrder = $request->get('sortOrder', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $perPage = $request->get('perPage', 10);
            $page = $request->get('page', 1);
            
            $products = $query->paginate($perPage, ['*'], 'page', $page);

            $transformedData = $products->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $product->price,
                    'sale_price' => $product->sale_price,
                    'purchase_price_per_unit' => $product->purchase_price_per_unit,
                    'sale_price_per_unit' => $product->sale_price_per_unit,
                    'quantity' => $product->quantity,
                    'unit' => $product->unit,
                    'status' => $product->status,
                    'featured' => $product->featured,
                    'category_id' => $product->category_id,
                    'category' => $product->category,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];
            });

            return response()->json([
                'data' => $transformedData,
                'total' => $products->total(),
                'per_page' => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
            ]);

        } catch (\Exception $e) {
            Log::error('Products getData error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to load data',
                'message' => $e->getMessage(),
                'data' => [],
                'total' => 0,
            ], 500);
        }
    }

    public function create()
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    public function store(Request $request)
    {
        try {
            // Convert tags to array if string
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
                'affiliate_commission' => 'required|numeric|min:0',
                
                'short_description' => 'nullable|string',
                'long_description' => 'nullable|string',
                'urdu_name' => 'nullable|string',
                'scientific_name' => 'nullable|string',
                'alternative_name' => 'nullable|string',
                'other_name' => 'nullable|string',
                'slug' => 'nullable|string|unique:products,slug',
                'unit' => 'required|string', // ml, kg, grams, etc
                'quantity' => 'required|numeric|min:0', // 100 ml, 1 kg, etc
                'purchase_price_per_unit' => 'required|numeric|min:0', // Price per 1 unit
                'sale_price_per_unit' => 'required|numeric|min:0', // Sale price per 1 unit
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
                'gallery.*' => 'nullable|image|max:2048',
            ]);

            // Calculate total purchase price and sale price
            $quantity = $validated['quantity'];
            $purchasePricePerUnit = $validated['purchase_price_per_unit'];
            $salePricePerUnit = $validated['sale_price_per_unit'];

            // Total Purchase Price = Quantity × Purchase Price Per Unit
            $validated['price'] = $quantity * $purchasePricePerUnit;

            // Total Sale Price = Quantity × Sale Price Per Unit
            $validated['sale_price'] = $quantity * $salePricePerUnit;

            // Validation: Sale price per unit should be greater than purchase price per unit
            if ($salePricePerUnit <= $purchasePricePerUnit) {
                return back()
                    ->withInput()
                    ->withErrors(['sale_price_per_unit' => 'Sale price per unit must be greater than purchase price per unit.']);
            }

            // Generate slug
            if (empty($validated['slug'])) {
                $validated['slug'] = str()->slug($validated['name']);
            }

            // Generate SKU
            if (empty($validated['sku'])) {
                $lastProduct = Product::latest('id')->first();
                $nextNumber = ($lastProduct?->id ?? 0) + 1;
                $validated['sku'] = 'PROD-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            }

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                $validated['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
            }

            // Handle social image upload
            if ($request->hasFile('social_image')) {
                $validated['social_image'] = $request->file('social_image')->store('products', 'public');
            }

            // Handle gallery upload
            if ($request->hasFile('gallery')) {
                $images = [];
                foreach ($request->file('gallery') as $img) {
                    $images[] = $img->store('products/gallery', 'public');
                }
                $validated['gallery'] = $images;
            }

            Product::create($validated);

            return to_route('products.index')->with('success', 'Product successfully created!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Product creation error: ' . $e->getMessage());
            return back()
                ->withInput()
                ->with('error', 'Failed to create product.');
        }
        return to_route('products.index')->with('success', 'Product successfully created!');
    }

    public function show(string $id)
    {
        $product = Product::findOrFail($id);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product
        ]);
    }

    public function edit(string $id)
    {
        $product = Product::findOrFail($id);

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        try {
            $product = Product::findOrFail($id);

            // Convert tags to array if string
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
                'affiliate_commission' => 'required|numeric|min:0',
                'short_description' => 'nullable|string',
                'long_description' => 'nullable|string',
                'urdu_name' => 'nullable|string',
                'scientific_name' => 'nullable|string',
                'alternative_name' => 'nullable|string',
                'other_name' => 'nullable|string',
                'slug' => 'nullable|string|unique:products,slug,' . $id,
                'unit' => 'required|string',
                'quantity' => 'required|numeric|min:0',
                'purchase_price_per_unit' => 'required|numeric|min:0',
                'sale_price_per_unit' => 'required|numeric|min:0',
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
                'gallery.*' => 'nullable|image|max:2048',
            ]);

            // Calculate total purchase price and sale price
            $quantity = $validated['quantity'];
            $purchasePricePerUnit = $validated['purchase_price_per_unit'];
            $salePricePerUnit = $validated['sale_price_per_unit'];

            $validated['price'] = $quantity * $purchasePricePerUnit;
            $validated['sale_price'] = $quantity * $salePricePerUnit;

            // Validation
            if ($salePricePerUnit <= $purchasePricePerUnit) {
                return back()
                    ->withInput()
                    ->withErrors(['sale_price_per_unit' => 'Sale price per unit must be greater than purchase price per unit.']);
            }

            // Update slug if name changed
            if ($validated['name'] !== $product->name && empty($validated['slug'])) {
                $validated['slug'] = str()->slug($validated['name']);
            }

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                if ($product->thumbnail) {
                    Storage::disk('public')->delete($product->thumbnail);
                }
                $validated['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
            }

            // Handle social image upload
            if ($request->hasFile('social_image')) {
                if ($product->social_image) {
                    Storage::disk('public')->delete($product->social_image);
                }
                $validated['social_image'] = $request->file('social_image')->store('products', 'public');
            }

            // Handle gallery upload
            if ($request->hasFile('gallery')) {
                if ($product->gallery && is_array($product->gallery)) {
                    foreach ($product->gallery as $oldImage) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }
                
                $images = [];
                foreach ($request->file('gallery') as $img) {
                    $images[] = $img->store('products/gallery', 'public');
                }
                $validated['gallery'] = $images;
            }

            $product->update($validated);

            return to_route('products.index')->with('success', 'Product successfully updated!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Product update error: ' . $e->getMessage());
            return back()
                ->withInput()
                ->with('error', 'Failed to update product.');
        }
    }

    public function destroy(string $id)
    {
        try {
            $product = Product::findOrFail($id);
            
            if ($product->thumbnail) {
                Storage::disk('public')->delete($product->thumbnail);
            }
            
            if ($product->social_image) {
                Storage::disk('public')->delete($product->social_image);
            }
            
            if ($product->gallery && is_array($product->gallery)) {
                foreach ($product->gallery as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
            
            $product->delete();
            
            return to_route('products.index')->with('success', 'Product successfully deleted!');

        } catch (\Exception $e) {
            Log::error('Product deletion error: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete product.');
        }
    }

    public function search(Request $request)
    {
        $search = $request->get('q', '');
        
        $products = Product::query()
            ->with(['variants:id,product_id,name,price,stock'])
            ->where('status', 'active')
            ->where(function($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->limit(20)
            ->get(['id', 'name', 'sku', 'price', 'stock']);

        $products = Product::
            with(['variants:id,product_id,name,price,stock'])
            ->limit(20)
            ->get(['id', 'name', 'sku', 'price', 'stock']);


        return response()->json($products);
    }

}
