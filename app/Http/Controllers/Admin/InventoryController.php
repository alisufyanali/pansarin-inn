<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view.inventory')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.inventory')->only(['create', 'store']);
        $this->middleware('permission:edit.inventory')->only(['edit', 'update']);
        $this->middleware('permission:delete.inventory')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $stats = [
            'totalProducts' => Product::count(),
            'lowStock' => Product::whereColumn('stock_qty', '<=', 'stock_alert')
                ->where('stock_qty', '>', 0)
                ->count(),
            'outOfStock' => Product::where('stock_qty', 0)->count(),
            'totalValue' => Product::sum(DB::raw('price * stock_qty')),
            'totalEntries' => Inventory::count(),
            'stockIn' => Inventory::where('type', 'in')->sum('quantity'),
            'stockOut' => Inventory::where('type', 'out')->sum(DB::raw('ABS(quantity)')),
        ];

        return Inertia::render('Admin/Inventory/Index', [
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        try {
            $query = Inventory::with([
                'product:id,name,sku,price,stock_qty,stock_alert,category_id,unit',
                'product.category:id,name',
                'performer:id,name'
            ])->latest();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                      ->orWhere('note', 'like', "%{$search}%")
                      ->orWhereHas('product', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('low_stock') && $request->low_stock === 'yes') {
                $query->whereHas('product', function($q) {
                    $q->whereColumn('stock_qty', '<=', 'stock_alert');
                });
            }

            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $sortBy = $request->get('sortBy', 'created_at');
            $sortOrder = $request->get('sortOrder', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $perPage = $request->get('perPage', 10);
            $inventories = $query->paginate($perPage);

            return response()->json([
                'data' => $inventories->items(),
                'total' => $inventories->total(),
                'per_page' => $inventories->perPage(),
                'current_page' => $inventories->currentPage(),
                'last_page' => $inventories->lastPage(),
            ]);

        } catch (\Exception $e) {
            Log::error('Inventory getData error: ' . $e->getMessage());
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
    return Inertia::render('Admin/Inventory/Create', [
        'products' => Product::with(['attributeValues.attribute'])
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'stock_qty', 'stock_alert', 'price', 'unit'])
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'stock_qty' => $product->stock_qty,
                    'stock_alert' => $product->stock_alert,
                    'price' => $product->price,
                    'unit' => $product->unit,
                    'attribute_values' => $product->attributeValues->map(function($av) {
                        return [
                            'id' => $av->id,
                            'attribute_id' => $av->attribute_id,
                            'value' => $av->value,
                            'attribute' => $av->attribute ? [
                                'id' => $av->attribute->id,
                                'name' => $av->attribute->name,
                            ] : null,
                        ];
                    }),
                ];
            }),
    ]);
}

    // InventoryController.php - store method update
public function store(Request $request)
{
    $product = Product::findOrFail($request->product_id);

    $validated = $request->validate([
        'product_id' => 'required|exists:products,id',
        'quantity' => 'required|numeric|min:0.01',
        'type' => 'required|in:in,out',
        'reference' => 'nullable|string|max:255',
        'note' => 'nullable|string',
    ]);

    // Unit product se uthayen kyunke form mein input nahi hai
    $validated['unit'] = $product->unit ?? 'units';

    DB::beginTransaction();
    try {
        if ($validated['type'] === 'out') {
            if ($product->stock_qty < $validated['quantity']) {
                return back()->with('error', "Insufficient stock!");
            }
            // Quantity ko negative karein stock out ke liye
            $validated['quantity'] = -abs($validated['quantity']);
        } else {
            // Stock in ke liye positive
            $validated['quantity'] = abs($validated['quantity']);
        }

        $validated['performed_by'] = Auth::id();
        
        // Create Inventory Entry
        Inventory::create($validated);

        DB::commit();
        return to_route('inventory.index')->with('success', 'Stock updated!');

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error($e->getMessage());
        return back()->with('error', 'Error: ' . $e->getMessage());
    }
}

    public function show(string $id)
    {
        $inventory = Inventory::with([
            'product.category',
            'performer'
        ])->findOrFail($id);

        return Inertia::render('Admin/Inventory/Show', [
            'inventory' => $inventory,
        ]);
    }

    public function edit(string $id)
{
    $inventory = Inventory::with('product')->findOrFail($id);

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
        'products' => Product::with(['attributeValues.attribute'])
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'stock_qty', 'stock_alert', 'price', 'unit'])
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'stock_qty' => $product->stock_qty,
                    'stock_alert' => $product->stock_alert,
                    'price' => $product->price,
                    'unit' => $product->unit,
                    'attribute_values' => $product->attributeValues->map(function($av) {
                        return [
                            'id' => $av->id,
                            'attribute_id' => $av->attribute_id,
                            'value' => $av->value,
                            'attribute' => $av->attribute ? [
                                'id' => $av->attribute->id,
                                'name' => $av->attribute->name,
                            ] : null,
                        ];
                    }),
                ];
            }),
    ]);
}

    public function update(Request $request, string $id)
    {
        $inventory = Inventory::findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.01',
            'type' => 'required|in:in,out',
            'reference' => 'nullable|string|max:255',
            'note' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            if ($validated['type'] === 'out') {
                $product = Product::find($validated['product_id']);
                
                $currentContribution = $inventory->quantity;
                $availableStock = $product->stock_qty - $currentContribution;
                
                if ($availableStock < $validated['quantity']) {
                    return back()
                        ->withInput()
                        ->with('error', "Insufficient stock! Available: {$availableStock} units");
                }
                
                $validated['quantity'] = -abs($validated['quantity']);
            }

            $inventory->update($validated);

            DB::commit();
            return to_route('inventory.index')
                ->with('success', 'Inventory entry successfully updated!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Inventory update error: ' . $e->getMessage());
            return back()
                ->withInput()
                ->with('error', 'Failed to update inventory entry: ' . $e->getMessage());
        }
    }

    public function destroy(string $id)
    {
        try {
            $inventory = Inventory::findOrFail($id);
            $inventory->delete();
            
            return to_route('inventory.index')
                ->with('success', 'Inventory entry successfully deleted!');
                
        } catch (\Exception $e) {
            Log::error('Inventory destroy error: ' . $e->getMessage());
            return back()
                ->with('error', 'Failed to delete inventory entry: ' . $e->getMessage());
        }
    }
}