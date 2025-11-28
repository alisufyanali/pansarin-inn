<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ProductVariant;
use App\Models\Product;
use App\Models\Attribute;

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
    public function index()
    {
        $variants = ProductVariant::with('product')->get();
        
        return Inertia::render('Admin/Variants/Index', [
            'variants' => $variants
        ]);
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
            'attributes' => 'nullable|array',
        ]);

        ProductVariant::create($validated);

        return to_route('product-variants.index')->with('success', 'Variant successfully created!');
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
    public function edit(string $id)
    {
        $variant = ProductVariant::findOrFail($id);

        return Inertia::render('Admin/Variants/Edit', [
            'variant' => $variant,
            'products' => Product::all(['id', 'name', 'price']),
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
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
            'attributes' => 'nullable|array',
        ]);

        $variant->update($validated);

        return to_route('product-variants.index')->with('success', 'Variant successfully updated!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        ProductVariant::destroy($id);
        
        return to_route('product-variants.index')->with('success', 'Variant successfully deleted!');
    }
}
