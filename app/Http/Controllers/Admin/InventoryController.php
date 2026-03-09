<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\InventoryRepository;
use App\Http\Requests\Admin\InventoryRequest;
use App\Http\Requests\Admin\BulkInventoryRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function __construct(protected InventoryRepository $inventoryRepository)
    {
        $this->middleware('permission:view.inventory')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.inventory')->only(['create', 'store']);
        $this->middleware('permission:edit.inventory')->only(['edit', 'update']);
        $this->middleware('permission:delete.inventory')->only(['destroy']);
    }

    public function index()
    {
        return Inertia::render('Admin/Inventory/Index', [
            'stats' => $this->inventoryRepository->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        try {
            return $this->inventoryRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Inventory getData: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
        }
    }

    public function create()
    {
        return Inertia::render('Admin/Inventory/Create', [
            'products' => $this->inventoryRepository->getProductsForForm(),
        ]);
    }

    public function store(InventoryRequest $request)
    {
        try {
            $this->inventoryRepository->store($request->validated());
            return to_route('admin.inventory.index')->with('success', 'Stock entry added!');
        } catch (\Exception $e) {
            Log::error('Inventory store: ' . $e->getMessage());
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function show(string $id)
    {
        try {
            $inventory = $this->inventoryRepository->find($id);

            // Get current stock from product_stocks
            $stockQuery = \App\Models\ProductStock::where('product_id', $inventory->product_id);
            if ($inventory->product_variant_id) {
                $stockQuery->where('product_variant_id', $inventory->product_variant_id);
            } else {
                $stockQuery->whereNull('product_variant_id');
            }
            $currentStock = $stockQuery->value('quantity') ?? 0;

            return Inertia::render('Admin/Inventory/Show', [
                'inventory'     => $inventory,
                'current_stock' => $currentStock,
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory show: ' . $e->getMessage());
            return redirect()->route('admin.inventory.index')->with('error', 'Entry not found.');
        }
    }

    public function edit(string $id)
    {
        try {
            $inventory = $this->inventoryRepository->find($id);

            return Inertia::render('Admin/Inventory/Edit', [
                'inventory' => [
                    'id'                 => $inventory->id,
                    'product_id'         => $inventory->product_id,
                    'product_variant_id' => $inventory->product_variant_id,
                    'quantity'           => abs($inventory->quantity),
                    'type'               => $inventory->type,
                    'cost_price'         => $inventory->cost_price,
                    'reference'          => $inventory->reference,
                    'source'             => $inventory->source,
                    'note'               => $inventory->note,
                ],
                'products' => $this->inventoryRepository->getProductsForForm(),
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory edit: ' . $e->getMessage());
            return redirect()->route('admin.inventory.index')->with('error', 'Entry not found.');
        }
    }

    public function update(InventoryRequest $request, string $id)
    {
        try {
            $this->inventoryRepository->update($id, $request->validated());
            return to_route('admin.inventory.index')->with('success', 'Inventory entry updated!');
        } catch (\Exception $e) {
            Log::error('Inventory update: ' . $e->getMessage());
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->inventoryRepository->delete($id);
            return to_route('admin.inventory.index')->with('success', 'Entry deleted!');
        } catch (\Exception $e) {
            Log::error('Inventory destroy: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete entry.');
        }
    }

    // ── Bulk Entry ────────────────────────────────────────────────

    public function bulkCreate()
    {
        $products = $this->inventoryRepository->getProductsForForm();
        return Inertia::render('Admin/Inventory/BulkCreate', [
            'products' => $products,
        ]);
    }

    public function bulkStore(BulkInventoryRequest $request)
    {
        try {
            $this->inventoryRepository->bulkStore($request->validated());
            return to_route('admin.inventory.index')->with('success', 'Bulk stock entry saved!');
        } catch (\Exception $e) {
            Log::error('Inventory bulkStore: ' . $e->getMessage());
            return back()->with('error', 'Failed: ' . $e->getMessage());
        }
    }
}