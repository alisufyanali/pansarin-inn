<?php

namespace App\Http\Repositories\Admin;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryRepository
{
    // ── DataTable ─────────────────────────────────────────────────
    public function getAllForDataTable(Request $request)
    {
        $query = Inventory::with([
            'product:id,name,sku,unit,category_id',
            'product.category:id,name',
            'variant:id,value,attributes,sku',
        ])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('note', 'like', "%{$search}%")
                  ->orWhereHas('product', fn ($q) =>
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                  );
            });
        }

        if ($request->filled('type'))   $query->where('type', $request->type);
        if ($request->filled('source')) $query->where('source', $request->source);

        if ($request->filled('low_stock') && $request->low_stock === 'yes') {
            $query->whereHas('product', fn ($q) =>
                $q->whereExists(function ($sub) {
                    $sub->from('product_stocks')
                        ->whereColumn('product_stocks.product_id', 'products.id')
                        ->whereNull('product_stocks.product_variant_id')
                        ->where('product_stocks.quantity', '<=', 10); // default alert
                })
            );
        }

        if ($request->filled('date_from')) $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->filled('date_to'))   $query->whereDate('created_at', '<=', $request->date_to);

        $query->orderBy($request->get('sortBy', 'created_at'), $request->get('sortOrder', 'desc'));
        $inventories = $query->paginate(min((int) $request->get('perPage', 10), 100));

        return response()->json([
            'data'         => $inventories->map(fn ($inv) => $this->formatRow($inv)),
            'total'        => $inventories->total(),
            'per_page'     => $inventories->perPage(),
            'current_page' => $inventories->currentPage(),
            'last_page'    => $inventories->lastPage(),
        ]);
    }

    private function formatRow(Inventory $inv): array
    {
        // Get current stock from product_stocks
        $stockQuery = ProductStock::where('product_id', $inv->product_id);
        if ($inv->product_variant_id) {
            $stockQuery->where('product_variant_id', $inv->product_variant_id);
        } else {
            $stockQuery->whereNull('product_variant_id');
        }
        $currentStock = $stockQuery->value('quantity') ?? 0;
        $stockAlert   = 10; // products table mein stock_alert nahi — variant ka use hoga future mein

        return [
            'id'                 => $inv->id,
            'product_id'         => $inv->product_id,
            'product_variant_id' => $inv->product_variant_id,
            'type'               => $inv->type,
            'quantity'           => $inv->quantity,
            'cost_price'         => $inv->cost_price,
            'reference'          => $inv->reference,
            'source'             => $inv->source,
            'note'               => $inv->note,
            'current_stock'      => $currentStock,
            'stock_alert'        => $stockAlert,
            'is_low_stock'       => $currentStock <= $stockAlert && $currentStock > 0,
            'is_out_of_stock'    => $currentStock <= 0,
            'product'            => $inv->product ? [
                'id'       => $inv->product->id,
                'name'     => $inv->product->name,
                'sku'      => $inv->product->sku,
                'unit'     => $inv->product->unit,
                'category' => $inv->product->category,
            ] : null,
            'variant'            => $inv->variant ? [
                'id'         => $inv->variant->id,
                'sku'        => $inv->variant->sku,
                'value'      => $inv->variant->value,
                'attributes' => $inv->variant->attributes,
            ] : null,
            'created_at'         => $inv->created_at,
        ];
    }

    // ── Find ──────────────────────────────────────────────────────
    public function find($id)
    {
        return Inventory::with(['product.category', 'variant'])->findOrFail($id);
    }

    // ── Store ─────────────────────────────────────────────────────
    public function store(array $data): Inventory
    {
        return DB::transaction(function () use ($data) {
            $qty       = abs((float) $data['quantity']);
            $isNegative = in_array($data['type'], ['out', 'adjustment']);

            // Validate stock for out transactions
            if ($isNegative) {
                $available = $this->getCurrentStock($data['product_id'], $data['product_variant_id'] ?? null);
                if ($available < $qty) {
                    throw new \Exception("Insufficient stock! Available: {$available}");
                }
            }

            // Save inventory ledger entry
            $inventory = Inventory::create([
                'product_id'         => $data['product_id'],
                'product_variant_id' => $data['product_variant_id'] ?? null,
                'type'               => $data['type'],
                'quantity'           => $isNegative ? -$qty : $qty,
                'cost_price'         => $data['cost_price'] ?? null,
                'reference'          => $data['reference'] ?? null,
                'source'             => $data['source'] ?? $this->defaultSource($data['type']),
                'note'               => $data['note'] ?? null,
            ]);

            // product_stocks — Model events handle karte hain (Inventory::booted)

            return $inventory;
        });
    }

    // ── Update ────────────────────────────────────────────────────
    public function update($id, array $data): Inventory
    {
        return DB::transaction(function () use ($id, $data) {
            $inventory  = $this->find($id);
            $oldQty     = $inventory->quantity; // already signed
            $newQty     = abs((float) $data['quantity']);
            $isNegative = in_array($data['type'], ['out', 'adjustment']);
            $signedNew  = $isNegative ? -$newQty : $newQty;

            // Reverse old entry effect, apply new
            $diff = $signedNew - $oldQty;

            if ($diff < 0) {
                // Net stock removal — check availability
                $available = $this->getCurrentStock($inventory->product_id, $inventory->product_variant_id);
                if ($available + $diff < 0) {
                    throw new \Exception("Insufficient stock! Available: {$available}");
                }
            }

            $inventory->update([
                'type'       => $data['type'],
                'quantity'   => $signedNew,
                'cost_price' => $data['cost_price'] ?? $inventory->cost_price,
                'reference'  => $data['reference']  ?? null,
                'source'     => $data['source']     ?? $inventory->source,
                'note'       => $data['note']       ?? null,
            ]);

            // product_stocks — Model events handle karte hain (Inventory::booted)

            return $inventory;
        });
    }

    // ── Delete ────────────────────────────────────────────────────
    public function delete($id): bool
    {
        return DB::transaction(function () use ($id) {
            $inventory = $this->find($id);

            // product_stocks — Model deleted event reverse karega automatically

            return $inventory->delete();
        });
    }

    // ── Stats ─────────────────────────────────────────────────────
    public function getStats(): array
    {
        // price column products table mein nahi — variants ki price se calculate
        $totalValue = \App\Models\ProductVariant::join('product_stocks', function($join) {
                $join->on('product_stocks.product_variant_id', '=', 'product_variants.id');
            })
            ->sum(DB::raw('product_stocks.quantity * product_variants.price'));

        $lowStock  = ProductStock::whereNull('product_variant_id')
            ->where('quantity', '<=', 10) // default alert threshold
            ->where('quantity', '>', 0)
            ->count();

        $outOfStock = ProductStock::whereNull('product_variant_id')
            ->where('quantity', '<=', 0)->count();

        return [
            'totalProducts' => Product::count(),
            'lowStock'      => $lowStock,
            'outOfStock'    => $outOfStock,
            'totalValue'    => round($totalValue, 2),
            'totalEntries'  => Inventory::count(),
            'stockIn'       => Inventory::whereIn('type', ['in', 'return'])->sum(DB::raw('ABS(quantity)')),
            'stockOut'      => Inventory::whereIn('type', ['out', 'adjustment'])->sum(DB::raw('ABS(quantity)')),
        ];
    }

    // ── Products for form ─────────────────────────────────────────
    public function getProductsForForm(): \Illuminate\Support\Collection
    {
        return Product::with('variants')
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'unit'])
            ->map(function ($product) {
                // Get stock from product_stocks
                $stock = ProductStock::where('product_id', $product->id)
                    ->whereNull('product_variant_id')
                    ->value('quantity') ?? 0;

                return [
                    'id'          => $product->id,
                    'name'        => $product->name,
                    'sku'         => $product->sku,
                    'stock_qty'   => $stock,
                    'stock_alert' => 5,
                    'price'       => 0,
                    'unit'        => $product->unit,
                    'variants'    => $product->variants->map(fn ($v) => [
                        'id'          => $v->id,
                        'sku'         => $v->sku,
                        'value'       => $v->value,
                        'attributes'  => $v->attributes,
                        'stock_qty'   => ProductStock::where('product_id', $product->id)
                                            ->where('product_variant_id', $v->id)
                                            ->value('quantity') ?? 0,
                    ]),
                ];
            });
    }


    private function defaultSource(string $type): string
    {
        return match ($type) {
            'in'         => 'purchase',
            'out'        => 'sale',
            'adjustment' => 'manual',
            'return'     => 'return',
            default      => 'manual',
        };
    }

    // ── Bulk Store ────────────────────────────────────────────────

    public function bulkStore(array $data): void
    {
        DB::transaction(function () use ($data) {
            foreach ($data['variants'] as $row) {
                $qty = (float) $row['quantity'];
                if ($qty <= 0) continue;

                Inventory::create([
                    'product_id'         => $data['product_id'],
                    'product_variant_id' => $row['variant_id'] ?? null,
                    'type'               => $data['type'],
                    'quantity'           => $this->signedQty($data['type'], $qty),
                    'cost_price'         => $data['cost_price'] ?? null,
                    'reference'          => $data['reference'] ?? null,
                    'source'             => $data['source'] ?? $this->defaultSource($data['type']),
                    'note'               => $data['note'] ?? null,
                ]);
                // product_stocks — Model booted event handle karega automatically
            }
        });
    }

    private function signedQty(string $type, float $qty): float
    {
        return in_array($type, ['out', 'adjustment']) ? -abs($qty) : abs($qty);
    }
}