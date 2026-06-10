<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ProductDealRepository;
use App\Http\Requests\Admin\ProductDealRequest;
use App\Models\Deal;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductsDealController extends Controller
{
    protected $dealRepository;

    public function __construct(ProductDealRepository $dealRepository)
    {
        $this->dealRepository = $dealRepository;
        $this->middleware('permission:view.deals')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.deals')->only(['create', 'store']);
        $this->middleware('permission:edit.deals')->only(['edit', 'update', 'toggleStatus', 'duplicate']);
        $this->middleware('permission:delete.deals')->only(['destroy']);
    }

    public function index()
    {
        $stats = $this->dealRepository->getStats();

        return Inertia::render('Admin/ProductsDeals/Index', [
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        try {
            return $this->dealRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Deals getData error: '.$e->getMessage());

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
        // Get all products
        $allProducts = Product::orderBy('name')
            ->get(['id', 'name']);

        // Try with active filter
        $activeProducts = Product::where('status', 1)
            ->orWhere('status', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = $activeProducts->count() > 0 ? $activeProducts : $allProducts;

        // Format products
        $formattedProducts = $products->map(fn ($p) => [
            'id'    => $p->id,
            'name'  => $p->name,
            'price' => null,
            'image' => null,
        ]);

        return Inertia::render('Admin/ProductsDeals/Create', [
            'products'  => $formattedProducts->values(),
            'dealTypes' => $this->getDealTypes(),
        ]);
    }

    public function store(ProductDealRequest $request)
    {
        try {
            $validated = $request->validated();

            $imageFile = $request->hasFile('image') ? $request->file('image') : null;

            $this->dealRepository->store($validated, $imageFile);

            return redirect()
                ->route('admin.deals.index')
                ->with('success', 'Deal created successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Deal creation error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to create deal.');
        }
    }

    public function show(Deal $deal)
    {
        $deal->load(['products' => function ($query) {
            $query->select('products.id', 'products.name')
                ->withPivot('custom_discount', 'stock_limit');
        }]);

        if ($deal->image) {
            $deal->image = asset('storage/' . $deal->image);
        }

        return Inertia::render('Admin/ProductsDeals/Show', [
            'deal' => $deal,
        ]);
    }

    public function edit(Deal $deal)
    {
        $deal->load(['products' => function ($query) {
            $query->select('products.id', 'products.name')
                ->withPivot('custom_discount', 'stock_limit');
        }]);

        // Format deal products for form
        $dealProducts = $deal->products->map(function ($product) {
            return [
                'id'              => $product->id,
                'name'            => $product->name,
                'price'           => null,
                'image'           => null,
                'custom_discount' => $product->pivot->custom_discount,
                'stock_limit'     => $product->pivot->stock_limit,
            ];
        });

        // Get all products for selector
        $allProducts     = Product::orderBy('name')->get(['id', 'name']);
        $activeProducts  = Product::where('status', 1)
            ->orWhere('status', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = $activeProducts->count() > 0 ? $activeProducts : $allProducts;

        $formattedProducts = $products->map(fn ($p) => [
            'id'    => $p->id,
            'name'  => $p->name,
            'price' => null,
            'image' => null,
        ]);

        // Fix deal image
        if ($deal->image) {
            $deal->image = asset('storage/'.$deal->image);
        }

        // Override deal products with formatted ones
        $dealData = $deal->toArray();
        $dealData['products'] = $dealProducts->map(function ($product) {
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

    public function update(ProductDealRequest $request, Deal $deal)
    {
        try {
            $validated = $request->validated();

            $imageFile = $request->hasFile('image') ? $request->file('image') : null;

            $this->dealRepository->update($deal->id, $validated, $imageFile);

            return redirect()
                ->route('admin.deals.index')
                ->with('success', 'Deal updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Deal update error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to update deal.');
        }
    }

    public function destroy(Deal $deal)
    {
        try {
            $this->dealRepository->delete($deal->id);

            return redirect()
                ->route('admin.deals.index')
                ->with('success', 'Deal deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Deal deletion error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete deal.');
        }
    }

    public function toggleStatus(Deal $deal)
    {
        try {
            $this->dealRepository->toggleStatus($deal->id);

            return back()->with('success', 'Deal status updated!');
        } catch (\Exception $e) {
            Log::error('Deal toggle status error: '.$e->getMessage());

            return back()->with('error', 'Failed to update deal status.');
        }
    }

    public function duplicate(Deal $deal)
    {
        try {
            $newDeal = $this->dealRepository->duplicate($deal->id);

            return redirect()
                ->route('admin.deals.edit', $newDeal)
                ->with('success', 'Deal duplicated successfully!');
        } catch (\Exception $e) {
            Log::error('Deal duplication error: '.$e->getMessage());

            return back()->with('error', 'Failed to duplicate deal.');
        }
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
