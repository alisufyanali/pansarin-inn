<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductsDealController extends Controller
{
    public function index()
    {
        $stats = [
            'total' => Deal::count(),
            'active' => Deal::active()->count(),
            'featured' => Deal::featured()->count(),
            'expired' => Deal::expired()->count(),
        ];

        return Inertia::render('Admin/ProductsDeals/Index', [
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        $query = Deal::withCount('products');

        // Search
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Filters
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('deal_type') && $request->deal_type) {
            $query->where('deal_type', $request->deal_type);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 10);
        $deals = $query->paginate($perPage);

        return response()->json($deals);
    }

    public function create()
    {
        // Get all products - FIXED: Only select columns that exist
        $allProducts = Product::orderBy('name')
            ->get(['id', 'name', 'price']);
        
        // Try with active filter
        $activeProducts = Product::where('is_active', 1)
            ->orWhere('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'price']);
        
        $products = $activeProducts->count() > 0 ? $activeProducts : $allProducts;
        
        // Format products - FIXED: Handle missing image column
        $formattedProducts = $products->map(function($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'image' => null, // No image column available
            ];
        });

        return Inertia::render('Admin/ProductsDeals/Create', [
            'products' => $formattedProducts->values(),
            'dealTypes' => $this->getDealTypes(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:deals,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'deal_type' => 'required|in:percentage,fixed,buy_x_get_y,bundle,flash_sale',
            'discount_value' => 'required_if:deal_type,percentage,fixed|nullable|numeric|min:0',
            'min_quantity' => 'required_if:deal_type,buy_x_get_y|nullable|integer|min:1',
            'free_quantity' => 'required_if:deal_type,buy_x_get_y|nullable|integer|min:0',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'badge_text' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:7',
            'display_order' => 'nullable|integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'products' => 'required|array|min:1',
            'products.*.id' => 'required|exists:products,id',
            'products.*.custom_discount' => 'nullable|numeric|min:0',
            'products.*.stock_limit' => 'nullable|integer|min:1',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('deals', 'public');
        }

        // Generate slug
        if (!isset($validated['slug']) || empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            
            // Ensure unique slug
            $count = 1;
            $originalSlug = $validated['slug'];
            while (Deal::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count;
                $count++;
            }
        }

        // Create deal
        $products = $validated['products'];
        unset($validated['products']);
        
        $deal = Deal::create($validated);

        // Attach products with pivot data
        foreach ($products as $product) {
            $deal->products()->attach($product['id'], [
                'custom_discount' => $product['custom_discount'] ?? null,
                'stock_limit' => $product['stock_limit'] ?? null,
            ]);
        }

        return redirect()
            ->route('deals.index')
            ->with('success', 'Deal created successfully!');
    }

    public function show(Deal $deal)
    {
        // FIXED: Only select columns that exist in products table
        $deal->load(['products' => function($query) {
            $query->select('products.id', 'products.name', 'products.price')
                  ->withPivot('custom_discount', 'stock_limit');
        }]);

        return Inertia::render('Admin/ProductsDeals/Show', [
            'deal' => $deal,
        ]);
    }

    public function edit(Deal $deal)
    {
        // FIXED: Only select columns that exist in products table
        $deal->load(['products' => function($query) {
            $query->select('products.id', 'products.name', 'products.price')
                  ->withPivot('custom_discount', 'stock_limit');
        }]);
        
        // Format deal products for form
        $dealProducts = $deal->products->map(function($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'image' => null, // No image column
                'custom_discount' => $product->pivot->custom_discount,
                'stock_limit' => $product->pivot->stock_limit,
            ];
        });

        // Get all products for selector
        $allProducts = Product::orderBy('name')->get(['id', 'name', 'price']);
        $activeProducts = Product::where('is_active', 1)
            ->orWhere('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'price']);
        
        $products = $activeProducts->count() > 0 ? $activeProducts : $allProducts;
        
        $formattedProducts = $products->map(function($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'image' => null,
            ];
        });

        // Fix deal image
        if ($deal->image) {
            $deal->image = asset('storage/' . $deal->image);
        }

        // Override deal products with formatted ones
        $dealData = $deal->toArray();
        $dealData['products'] = $dealProducts->map(function($product) {
            return [
                'id' => $product['id'],
                'custom_discount' => $product['custom_discount'],
                'stock_limit' => $product['stock_limit'],
            ];
        })->values();

        return Inertia::render('Admin/ProductsDeals/Edit', [
            'deal' => $dealData,
            'products' => $formattedProducts->values(),
            'dealTypes' => $this->getDealTypes(),
        ]);
    }

    public function update(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:deals,slug,' . $deal->id,
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'deal_type' => 'required|in:percentage,fixed,buy_x_get_y,bundle,flash_sale',
            'discount_value' => 'required_if:deal_type,percentage,fixed|nullable|numeric|min:0',
            'min_quantity' => 'required_if:deal_type,buy_x_get_y|nullable|integer|min:1',
            'free_quantity' => 'required_if:deal_type,buy_x_get_y|nullable|integer|min:0',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'badge_text' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:7',
            'display_order' => 'nullable|integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'products' => 'required|array|min:1',
            'products.*.id' => 'required|exists:products,id',
            'products.*.custom_discount' => 'nullable|numeric|min:0',
            'products.*.stock_limit' => 'nullable|integer|min:1',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($deal->image) {
                Storage::disk('public')->delete($deal->image);
            }
            $validated['image'] = $request->file('image')->store('deals', 'public');
        }

        // Update deal
        $products = $validated['products'];
        unset($validated['products']);
        
        $deal->update($validated);

        // Sync products with pivot data
        $syncData = [];
        foreach ($products as $product) {
            $syncData[$product['id']] = [
                'custom_discount' => $product['custom_discount'] ?? null,
                'stock_limit' => $product['stock_limit'] ?? null,
            ];
        }
        $deal->products()->sync($syncData);

        return redirect()
            ->route('deals.index')
            ->with('success', 'Deal updated successfully!');
    }

    public function destroy(Deal $deal)
    {
        if ($deal->image) {
            Storage::disk('public')->delete($deal->image);
        }

        $deal->delete();

        return redirect()
            ->route('deals.index')
            ->with('success', 'Deal deleted successfully!');
    }

    public function toggleStatus(Deal $deal)
    {
        $deal->update(['is_active' => !$deal->is_active]);

        return back()->with('success', 'Deal status updated!');
    }

    public function duplicate(Deal $deal)
    {
        $newDeal = $deal->replicate();
        $newDeal->title = $deal->title . ' (Copy)';
        $newDeal->slug = Str::slug($newDeal->title);
        
        // Ensure unique slug
        $count = 1;
        $originalSlug = $newDeal->slug;
        while (Deal::where('slug', $newDeal->slug)->exists()) {
            $newDeal->slug = $originalSlug . '-' . $count;
            $count++;
        }
        
        $newDeal->is_active = false;
        $newDeal->current_uses = 0;
        $newDeal->save();

        // Copy products
        foreach ($deal->products as $product) {
            $newDeal->products()->attach($product->id, [
                'custom_discount' => $product->pivot->custom_discount,
                'stock_limit' => $product->pivot->stock_limit,
            ]);
        }

        return redirect()
            ->route('deals.edit', $newDeal)
            ->with('success', 'Deal duplicated successfully!');
    }

    private function getDealTypes()
    {
        return [
            ['value' => 'percentage', 'label' => 'Percentage Discount (%)'],
            ['value' => 'fixed', 'label' => 'Fixed Amount Discount (Rs.)'],
            ['value' => 'bundle', 'label' => 'Bundle Deal'],
            ['value' => 'buy_x_get_y', 'label' => 'Buy X Get Y Free'],
            ['value' => 'flash_sale', 'label' => 'Flash Sale'],
        ];
    }
}