<?php

namespace App\Http\Repositories\Admin;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderRepository
{
    // ── DataTable ─────────────────────────────────────────────────
    public function getAllForDataTable($request)
    {
        $query = Order::with([
            'customer',
            'city:id,name',
            'items',
        ])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($q) =>
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                  );
            });
        }

        if ($request->filled('status'))         $query->where('status', $request->status);
        if ($request->filled('payment_status')) $query->where('payment_status', $request->payment_status);

        return $query;
    }

    // ── Find ──────────────────────────────────────────────────────
    public function find($id)
    {
        $order = Order::with(['customer', 'items.product', 'items.variant'])->findOrFail($id);

        // Format items for frontend
        $order->items->transform(function ($item) {
            $item->product_name  = $item->meta['product_name'] ?? $item->product?->name;
            $item->variant_label = $item->meta['variant_name'] ?? $item->variant?->value;
            return $item;
        });

        return $order;
    }

    // ── Store ─────────────────────────────────────────────────────
    public function store(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            Cache::forget('order_stats');
            $order = Order::create([
                'customer_id'      => $data['customer_id'],
                'city_id'          => $data['city_id'] ?? null,
                'invoice_discount' => $data['invoice_discount'] ?? 0,
                'shipping_charges' => $data['shipping_charges'] ?? 0,
                'tax'              => $data['tax'] ?? 0,
                'status'           => $data['status'],
                'payment_status'   => $data['payment_status'],
                'payment_method'   => $data['payment_method'] ?? null,
                'payment_date'     => $data['payment_date'] ?? null,
                'shipping_method'  => $data['shipping_method'] ?? null,
                'courier_weight'   => $data['courier_weight'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'billing_address'  => $data['billing_address'] ?? null,
                'order_note'       => $data['order_note'] ?? null,
                'user_id'          => auth()->id(),
            ]);

            $this->syncItems($order, $data['items']);
            $order->calculateTotals();
            $order->load('items.product', 'items.variant');

            return $order;
        });
    }

    // ── Update ────────────────────────────────────────────────────
    public function update($id, array $data): Order
    {
        return DB::transaction(function () use ($id, $data) {
            $order = Order::findOrFail($id);

            $order->update([
                'customer_id'      => $data['customer_id'],
                'city_id'          => $data['city_id'] ?? null,
                'invoice_discount' => $data['invoice_discount'] ?? 0,
                'shipping_charges' => $data['shipping_charges'] ?? 0,
                'tax'              => $data['tax'] ?? 0,
                'status'           => $data['status'],
                'payment_status'   => $data['payment_status'],
                'payment_method'   => $data['payment_method'] ?? null,
                'payment_date'     => $data['payment_date'] ?? null,
                'shipping_method'  => $data['shipping_method'] ?? null,
                'courier_weight'   => $data['courier_weight'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'billing_address'  => $data['billing_address'] ?? null,
                'order_note'       => $data['order_note'] ?? null,
            ]);

            // Purane items ka stock wapas karo (reverse inventory)
            $order->load('items');
            foreach ($order->items as $oldItem) {
                \App\Models\Inventory::create([
                    'product_id'         => $oldItem->product_id,
                    'product_variant_id' => $oldItem->product_variant_id,
                    'type'               => 'in',
                    'quantity'           => $oldItem->quantity,
                    'source'             => 'order_edit',
                    'reference'          => $order->order_number,
                    'note'               => 'Order edit reversal #' . $order->order_number,
                ]);
            }

            $order->items()->delete();
            $this->syncItems($order, $data['items']);
            $order->load('items');
            $order->calculateTotals();

            return $order;
        });
    }

    // ── Delete ────────────────────────────────────────────────────
    public function delete($id): bool
    {
        return DB::transaction(function () use ($id) {
            Cache::forget('order_stats');
            $order = Order::with('items')->findOrFail($id);

            // Stock wapas karo
            foreach ($order->items as $item) {
                \App\Models\Inventory::create([
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'type'               => 'in',
                    'quantity'           => $item->quantity,
                    'source'             => 'order_delete',
                    'reference'          => $order->order_number,
                    'note'               => 'Order deleted #' . $order->order_number,
                ]);
            }

            $order->items()->delete();
            return $order->delete();
        });
    }

    // ── Status Updates ────────────────────────────────────────────
    public function updateStatus($id, string $status): Order
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => $status]);
        return $order->fresh();
    }

    public function updatePaymentStatus($id, array $data): Order
    {
        $order = Order::findOrFail($id);
        $order->update([
            'payment_status' => $data['payment_status'],
            'payment_date'   => $data['payment_date'] ?? now(),
        ]);
        return $order;
    }

    // ── Stats ─────────────────────────────────────────────────────
    public function getStats(): array
    {
        return Cache::remember('order_stats', 300, function () {
            $counts = Order::selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN payment_status = 'paid' THEN grand_total ELSE 0 END) as totalRevenue
            ")->first();

            return [
                'total'        => (int) $counts->total,
                'pending'      => (int) $counts->pending,
                'processing'   => (int) $counts->processing,
                'delivered'    => (int) $counts->delivered,
                'totalRevenue' => (float) $counts->totalRevenue,
            ];
        });
    }

    // ── Products for Form ─────────────────────────────────────────
    public function getProductsForForm(): \Illuminate\Support\Collection
    {
        $products = Product::with(['variants'])
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'unit']);

        // Scope stock query to only the fetched product IDs — avoids loading entire table
        $productIds = $products->pluck('id');
        $allStocks = ProductStock::whereIn('product_id', $productIds)
            ->get()
            ->groupBy(function ($s) {
                return $s->product_id . '_' . ($s->product_variant_id ?? 'null');
            });

        return $products->map(function ($p) use ($allStocks) {
                $hasVariants = $p->variants->isNotEmpty();

                if ($hasVariants) {
                    $baseStock = $allStocks->filter(fn($g, $k) => str_starts_with($k, $p->id . '_') && !str_ends_with($k, '_null'))->sum(fn($g) => $g->sum('quantity'));
                } else {
                    $stockRecord = $allStocks->get($p->id . '_null')?->first();
                    $baseStock   = $stockRecord ? $stockRecord->quantity : 0;
                }

                // Default price: use first variant's sale/price, or 0 if no variants
                $defaultVariant = $p->variants->first();

                return [
                    'id'       => $p->id,
                    'name'     => $p->name,
                    'sku'      => $p->sku,
                    'unit'     => $p->unit,
                    'price'    => $defaultVariant ? (float) ($defaultVariant->sale_price ?: $defaultVariant->price ?: 0) : 0,
                    'stock'    => (int) $baseStock,
                    'variants' => $p->variants->map(fn ($v) => [
                        'id'    => $v->id,
                        'name'  => collect($v->attributes ?? [])->values()->join(' / ') ?: $v->value,
                        'sku'   => $v->sku,
                        'price' => $v->sale_price ?? $v->price ?? 0,
                        'stock' => (int) ($allStocks->get($p->id . '_' . $v->id)?->first()?->quantity ?? 0),
                    ]),
                ];
            });
    }

    // ── Private Helpers ───────────────────────────────────────────
    private function syncItems(Order $order, array $items): void
    {
        // Pre-load all products, variants, and stocks in 3 queries — eliminates N+1
        $productIds = collect($items)->pluck('product_id')->filter()->unique();
        $variantIds = collect($items)->pluck('product_variant_id')->filter()->unique();

        $products = Product::whereIn('id', $productIds)
            ->get(['id', 'name', 'sku'])
            ->keyBy('id');

        $variants = ProductVariant::whereIn('id', $variantIds)
            ->get(['id', 'value', 'attributes', 'price'])
            ->keyBy('id');

        $stocks = ProductStock::whereIn('product_id', $productIds)
            ->get()
            ->groupBy(fn ($s) => $s->product_id . '_' . ($s->product_variant_id ?? 'null'));

        // FIRST: Validate stock availability for all items before creating any
        foreach ($items as $item) {
            if (empty($item['product_id'])) continue;

            $qty       = (int) $item['quantity'];
            $variantId = $item['product_variant_id'] ?? null;
            $stockKey  = $item['product_id'] . '_' . ($variantId ?? 'null');

            $availableStock = (int) ($stocks->get($stockKey)?->first()?->quantity ?? 0);

            if ($qty > $availableStock) {
                $product = $products->get($item['product_id']);
                $variant = $variantId ? $variants->get($variantId) : null;

                $productName = $product?->name ?? 'Unknown Product';
                $variantName = $variant
                    ? (collect($variant->attributes ?? [])->values()->join(' / ') ?: $variant->value)
                    : null;
                $fullName = $variantName ? "{$productName} ({$variantName})" : $productName;

                throw \Illuminate\Validation\ValidationException::withMessages([
                    'items' => "Insufficient stock for {$fullName}. Requested: {$qty}, Available: {$availableStock}",
                ]);
            }
        }

        // THEN: Create order items and deduct stock
        foreach ($items as $item) {
            if (empty($item['product_id'])) continue;

            $product = $products->get($item['product_id']);
            $variant = !empty($item['product_variant_id'])
                ? $variants->get($item['product_variant_id'])
                : null;

            $qty      = (int) $item['quantity'];
            $price    = (float) $item['price'];
            $discount = (float) ($item['discount'] ?? 0);
            $subtotal = ($price * $qty) - $discount;

            // Cost price: variant's price column is the purchase/cost price in this schema.
            // Products table carries no cost column.
            $costPrice = 0;
            if ($variant) {
                $costPrice = (float) $variant->price;
            }

            $order->items()->create([
                'product_id'         => $item['product_id'],
                'product_variant_id' => $item['product_variant_id'] ?? null,
                'quantity'           => $qty,
                'price'              => $price,
                'cost_price'         => $costPrice,
                'discount'           => $discount,
                'subtotal'           => $subtotal,
                'meta'               => [
                    'product_name' => $product?->name,
                    'sku'          => $product?->sku,
                    'variant_name' => $variant
                        ? collect($variant->attributes ?? [])->values()->join(' / ') ?: $variant->value
                        : null,
                    'cost_price'   => $costPrice,
                ],
            ]);

            // Stock deduct karo — Inventory entry create karo (booted event stock update karega)
            \App\Models\Inventory::create([
                'product_id'         => $item['product_id'],
                'product_variant_id' => $item['product_variant_id'] ?? null,
                'type'               => 'out',
                'quantity'           => -$qty,
                'source'             => 'order',
                'reference'          => $order->order_number,
                'note'               => 'Order #' . $order->order_number,
            ]);
        }
    }
}