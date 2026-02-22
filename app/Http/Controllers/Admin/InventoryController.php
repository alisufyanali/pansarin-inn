<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\InventoryRepository;
use App\Http\Requests\Admin\InventoryRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InventoryController extends Controller
{
    protected $inventoryRepository;

    public function __construct(InventoryRepository $inventoryRepository)
    {
        $this->inventoryRepository = $inventoryRepository;
        $this->middleware('permission:view.inventory')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.inventory')->only(['create', 'store']);
        $this->middleware('permission:edit.inventory')->only(['edit', 'update']);
        $this->middleware('permission:delete.inventory')->only(['destroy']);
    }

    public function index(Request $request)
    {
        try {
            $stats = $this->inventoryRepository->getStats();

            return Inertia::render('Admin/Inventory/Index', [
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory index error: '.$e->getMessage());

            return back()->with('error', 'Failed to load inventory.');
        }
    }

    public function getData(Request $request)
    {
        try {
            return $this->inventoryRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Inventory getData error: '.$e->getMessage());

            return response()->json([
                'error' => 'Failed to load inventory data',
                'message' => $e->getMessage(),
                'data' => [],
                'total' => 0,
            ], 500);
        }
    }

    public function create()
    {
        try {
            $products = $this->inventoryRepository->getProductsForForm();

            return Inertia::render('Admin/Inventory/Create', [
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory create error: '.$e->getMessage());

            return redirect()->route('admin.inventory.index')
                ->with('error', 'Failed to load create form.');
        }
    }

    public function store(InventoryRequest $request)
    {
        try {
            $validated = $request->validated();

            $this->inventoryRepository->store($validated, Auth::id());

            return to_route('admin.inventory.index')->with('success', 'Stock updated!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Inventory creation error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function show(string $id)
    {
        try {
            $inventory = $this->inventoryRepository->find($id);

            return Inertia::render('Admin/Inventory/Show', [
                'inventory' => $inventory,
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory show error: '.$e->getMessage());

            return redirect()->route('admin.inventory.index')
                ->with('error', 'Failed to load inventory entry.');
        }
    }

    public function edit(string $id)
    {
        try {
            $inventory = $this->inventoryRepository->find($id);
            $products = $this->inventoryRepository->getProductsForForm();

            return Inertia::render('Admin/Inventory/Edit', [
                'inventory' => [
                    'id' => $inventory->id,
                    'product_id' => $inventory->product_id,
                    'quantity' => abs($inventory->quantity),
                    'unit' => $inventory->unit,
                    'type' => $inventory->type,
                    'reference' => $inventory->reference,
                    'note' => $inventory->note,
                ],
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory edit error: '.$e->getMessage());

            return redirect()->route('admin.inventory.index')
                ->with('error', 'Failed to load inventory entry.');
        }
    }

    public function update(InventoryRequest $request, string $id)
    {
        try {
            $validated = $request->validated();

            $this->inventoryRepository->update($id, $validated);

            return to_route('admin.inventory.index')
                ->with('success', 'Inventory entry successfully updated!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Inventory update error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->inventoryRepository->delete($id);

            return to_route('admin.inventory.index')
                ->with('success', 'Inventory entry successfully deleted!');
        } catch (\Exception $e) {
            Log::error('Inventory destroy error: '.$e->getMessage());

            return back()
                ->with('error', 'Failed to delete inventory entry.');
        }
    }
}
