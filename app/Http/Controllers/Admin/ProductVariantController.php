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
use Yajra\DataTables\Facades\DataTables;

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
            $query = $this->variantRepository->getAllForDataTable($request);

            return DataTables::of($query)
                ->addColumn('product_name', function ($variant) {
                    return $variant->product ? $variant->product->name : null;
                })
                ->addColumn('status_text', function ($variant) {
                    return $variant->status ? 'Active' : 'Inactive';
                })
                ->addColumn('is_default_text', function ($variant) {
                    return $variant->is_default ? 'Yes' : 'No';
                })
                ->addColumn('stock', function ($variant) {
                    return $variant->stock ? $variant->stock->quantity : 0;
                })
                ->addColumn('stock_status', function ($variant) {
                    $quantity = $variant->stock ? $variant->stock->quantity : 0;
                    return $quantity > 0 ? 'In Stock' : 'Out of Stock';
                })
                ->make(true);
        } catch (\Exception $e) {
            Log::error('Failed to get variants data: '.$e->getMessage());

            return response()->json(['error' => 'Failed to load data'], 500);
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

}
