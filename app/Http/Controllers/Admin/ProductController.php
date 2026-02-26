<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ProductRepository;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Attribute;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{
    protected $productRepository;

    public function __construct(ProductRepository $productRepository)
    {
        $this->productRepository = $productRepository;
        $this->middleware('permission:view.products')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.products')->only(['create', 'store']);
        $this->middleware('permission:edit.products')->only(['edit', 'update']);
        $this->middleware('permission:delete.products')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $stats = $this->productRepository->getStats();

        return Inertia::render('Admin/Products/Index', [
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        try {
            return $this->productRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Products getData error: ' . $e->getMessage());

            return response()->json([
                'error'   => 'Failed to load data',
                'message' => $e->getMessage(),
                'data'    => [],
                'total'   => 0,
            ], 500);
        }
    }

    public function create()
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            // Sare attributes pass karo — frontend category change pe filter karega
            'attributes' => Attribute::with('values')->get(['id', 'name', 'slug', 'category_id']),
        ]);
    }

    // ── API: Category ke attributes fetch karo (AJAX) ──
    public function getAttributesByCategory(Request $request)
    {
        $categoryId = $request->get('category_id');

        if (!$categoryId) {
            return response()->json([]);
        }

        $attributes = Attribute::with('values')
            ->where('category_id', $categoryId)
            ->get(['id', 'name', 'slug', 'category_id']);

        return response()->json($attributes);
    }

    public function store(ProductRequest $request)
    {
        try {
            if ($request->has('tags') && is_string($request->tags)) {
                $request->merge([
                    'tags' => collect(explode(',', $request->tags))
                        ->map(fn($tag) => trim($tag))
                        ->filter()
                        ->values()
                        ->toArray(),
                ]);
            }

            $validated = $request->validated();

            // Handle variations-based products
            if (!empty($validated['variations'])) {
                // For variation-based products, we don't need unit/quantity/price fields
                // Variations will be stored separately
            } else {
                // Handle simple products with unit/quantity/price
                if (isset($validated['quantity'], $validated['purchase_price_per_unit'], $validated['sale_price_per_unit'])) {
                    $quantity             = $validated['quantity'];
                    $purchasePricePerUnit = $validated['purchase_price_per_unit'];
                    $salePricePerUnit     = $validated['sale_price_per_unit'];

                    $validated['price']      = $quantity * $purchasePricePerUnit;
                    $validated['sale_price'] = $quantity * $salePricePerUnit;

                    if ($salePricePerUnit <= $purchasePricePerUnit) {
                        return back()
                            ->withInput()
                            ->withErrors(['sale_price_per_unit' => 'Sale price per unit must be greater than purchase price per unit.']);
                    }
                }
            }

            if (empty($validated['sku'])) {
                $lastProduct      = Product::latest('id')->first();
                $nextNumber       = ($lastProduct?->id ?? 0) + 1;
                $validated['sku'] = 'PROD-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            }

            $thumbnailFile   = $request->hasFile('thumbnail')    ? $request->file('thumbnail')    : null;
            $socialImageFile = $request->hasFile('social_image') ? $request->file('social_image') : null;
            $galleryFiles    = $request->hasFile('gallery')      ? $request->file('gallery')      : [];

            $this->productRepository->store($validated, $thumbnailFile, $socialImageFile, $galleryFiles);

            return to_route('admin.products.index')->with('success', 'Product successfully created!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Product creation error: ' . $e->getMessage());

            return back()->withInput()->with('error', 'Failed to create product.');
        }
    }

    public function show(string $id)
    {
        $product = $this->productRepository->find($id);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(string $id)
    {
        $product = $this->productRepository->find($id);

        return Inertia::render('Admin/Products/Edit', [
            'product'    => $product,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'attributes' => Attribute::with('values')->get(['id', 'name', 'slug', 'category_id']),
        ]);
    }

    public function update(ProductRequest $request, string $id)
    {
        try {
            if ($request->has('tags') && is_string($request->tags)) {
                $request->merge([
                    'tags' => collect(explode(',', $request->tags))
                        ->map(fn($tag) => trim($tag))
                        ->filter()
                        ->values()
                        ->toArray(),
                ]);
            }

            $validated = $request->validated();

            // Handle variations-based products
            if (!empty($validated['variations'])) {
                // For variation-based products, we don't need unit/quantity/price fields
                // Variations will be stored separately
            } else {
                // Handle simple products with unit/quantity/price
                if (isset($validated['quantity'], $validated['purchase_price_per_unit'], $validated['sale_price_per_unit'])) {
                    $quantity             = $validated['quantity'];
                    $purchasePricePerUnit = $validated['purchase_price_per_unit'];
                    $salePricePerUnit     = $validated['sale_price_per_unit'];

                    $validated['price']      = $quantity * $purchasePricePerUnit;
                    $validated['sale_price'] = $quantity * $salePricePerUnit;

                    if ($salePricePerUnit <= $purchasePricePerUnit) {
                        return back()
                            ->withInput()
                            ->withErrors(['sale_price_per_unit' => 'Sale price per unit must be greater than purchase price per unit.']);
                    }
                }
            }

            $thumbnailFile   = $request->hasFile('thumbnail')    ? $request->file('thumbnail')    : null;
            $socialImageFile = $request->hasFile('social_image') ? $request->file('social_image') : null;
            $galleryFiles    = $request->hasFile('gallery')      ? $request->file('gallery')      : [];

            $this->productRepository->update($id, $validated, $thumbnailFile, $socialImageFile, $galleryFiles);

            return to_route('admin.products.index')->with('success', 'Product successfully updated!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Product update error: ' . $e->getMessage());

            return back()->withInput()->with('error', 'Failed to update product.');
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->productRepository->delete($id);

            return to_route('admin.products.index')->with('success', 'Product successfully deleted!');

        } catch (\Exception $e) {
            Log::error('Product deletion error: ' . $e->getMessage());

            return back()->with('error', 'Failed to delete product.');
        }
    }

    public function search(Request $request)
    {
        $search = $request->get('q', '');

        $products = Product::with(['variants:id,product_id,name,price,stock'])
            ->where('status', 'active')
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->limit(20)
            ->get(['id', 'name', 'sku', 'price', 'stock']);

        return response()->json($products);
    }
}