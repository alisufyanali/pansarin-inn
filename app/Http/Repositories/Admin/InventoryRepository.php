<?php

namespace App\Http\Repositories\Admin;

use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryRepository
{
    /**
     * Get all inventory entries
     */
    public function getAll()
    {
        return Inventory::with(['product', 'performer'])->latest()->get();
    }

    /**
     * Get paginated data for inventory
     */
    public function getAllForDataTable(Request $request)
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
            Log::error('Inventory DataTable error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Find inventory by ID
     */
    public function find($id)
    {
        return Inventory::with(['product.category', 'performer'])->findOrFail($id);
    }

    /**
     * Create new inventory entry
     */
    public function store(array $data, $userId)
    {
        DB::beginTransaction();
        try {
            $product = Product::findOrFail($data['product_id']);
            
            // Set unit from product
            $data['unit'] = $product->unit ?? 'units';
            
            // Handle stock out
            if ($data['type'] === 'out') {
                if ($product->stock_qty < $data['quantity']) {
                    throw new \Exception("Insufficient stock!");
                }
                $data['quantity'] = -abs($data['quantity']);
            } else {
                $data['quantity'] = abs($data['quantity']);
            }

            $data['performed_by'] = $userId;
            
            $inventory = Inventory::create($data);

            DB::commit();
            return $inventory;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Inventory creation error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update inventory entry
     */
    public function update($id, array $data)
    {
        DB::beginTransaction();
        try {
            $inventory = $this->find($id);
            
            if ($data['type'] === 'out') {
                $product = Product::find($data['product_id']);
                
                $currentContribution = $inventory->quantity;
                $availableStock = $product->stock_qty - $currentContribution;
                
                if ($availableStock < $data['quantity']) {
                    throw new \Exception("Insufficient stock! Available: {$availableStock} units");
                }
                
                $data['quantity'] = -abs($data['quantity']);
            } else {
                $data['quantity'] = abs($data['quantity']);
            }

            $inventory->update($data);

            DB::commit();
            return $inventory;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Inventory update error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete inventory entry
     */
    public function delete($id)
    {
        try {
            $inventory = $this->find($id);
            return $inventory->delete();
        } catch (\Exception $e) {
            Log::error('Inventory deletion error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get inventory statistics
     */
    public function getStats()
    {
        return [
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
    }

    /**
     * Get products for inventory form
     */
    public function getProductsForForm()
    {
        return Product::with(['attributeValues.attribute'])
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
            });
    }
}
