<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ProductVariantRepository;
use App\Http\Requests\Admin\ProductVariantRequest;
use App\Models\Attribute;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;


class ProductVariantController extends Controller
{
    protected $variantRepository;

    public function __construct(ProductVariantRepository $variantRepository)
    {
        $this->variantRepository = $variantRepository; 
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
            Log::error('Failed to load variants index: '.$e->getMessage());

            return back()->with('error', 'Failed to load variants');
        }
    }

    /**
     * Get DataTable data - API endpoint for DataTableWrapper
     */
    public function getData(Request $request)
    {
        try {
            return $this->variantRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Failed to get variants data: '.$e->getMessage());

            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
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
                'variant' => $variant,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load variant: '.$e->getMessage());

            return back()->with('error', 'Variant not found');
        }
    }

    public function create()
    {
        try {
            return Inertia::render('Admin/Variants/Create', [
                'products'   => Product::orderBy('name')->get(['id', 'name']),
                'attributes' => Attribute::with('values')->get(['id', 'name']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load variant create: '.$e->getMessage());
            return redirect()->route('admin.product-variants.index')->with('error', 'Failed to load form.');
        }
    }

    public function store(ProductVariantRequest $request)
    {
        try {
            $this->variantRepository->store($request->validated());
            return to_route('admin.product-variants.index')->with('success', 'Variant created successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to create variant: '.$e->getMessage());
            return back()->withInput()->with('error', 'Failed to create variant.');
        }
    }

    public function edit(string $id)
    {
        try {
            $variant = $this->variantRepository->find($id);
            return Inertia::render('Admin/Variants/Edit', [
                'variant'    => $variant,
                'products'   => Product::orderBy('name')->get(['id', 'name']),
                'attributes' => Attribute::with('values')->get(['id', 'name']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load variant edit: '.$e->getMessage());
            return redirect()->route('admin.product-variants.index')->with('error', 'Failed to load variant.');
        }
    }

    public function update(ProductVariantRequest $request, string $id)
    {
        try {
            $this->variantRepository->update($id, $request->validated());
            return to_route('admin.product-variants.index')->with('success', 'Variant updated successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to update variant: '.$e->getMessage());
            return back()->withInput()->with('error', 'Failed to update variant.');
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->variantRepository->delete($id);
            return redirect()->route('admin.product-variants.index')->with('success', 'Variant deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to delete variant: '.$e->getMessage());
            return redirect()->route('admin.product-variants.index')->with('error', 'Failed to delete variant.');
        }
    }

}
