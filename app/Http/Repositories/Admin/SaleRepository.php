<?php

namespace App\Http\Repositories\Admin;

use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductVariant;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SaleRepository
{
    public function getAllForDataTable($request)
    {
        $query = Sale::with(['customer', 'order'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sale_code', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($q) =>
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                  );
            });
        }

        if ($request->filled('delivery_status')) $query->where('delivery_status', $request->delivery_status);
        if ($request->filled('payment_status'))  $query->where('payment_status', $request->payment_status);

        return $query;
    }

    public function find($id)
    {
        return Sale::with(['customer', 'order', 'items.product', 'items.variant'])->findOrFail($id);
    }

    public function store(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $sale = Sale::create([
                'order_id'         => $data['order_id'],
                'customer_id'      => $data['customer_id'],
                'sale_code'        => Sale::generateSaleCode($data['order_number'] ?? $data['order_id']),
                'invoice_discount' => $data['invoice_discount'] ?? 0,
                'vat'              => $data['vat'] ?? 0,
                'vat_percent'      => $data['vat_percent'] ?? null,
                'shipping_charges' => $data['shipping_charges'] ?? 0,
                'delivery_status'  => $data['delivery_status'],
                'payment_status'   => $data['payment_status'],
                'payment_type'     => $data['payment_type'] ?? null,
                'payment_timestamp'=> $data['payment_timestamp'] ?? null,
                'shipping_method'  => $data['shipping_method'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'shipping_response'=> $data['shipping_response'] ?? null,
                'delivery_datetime'=> $data['delivery_datetime'] ?? null,
                'remarks'          => $data['remarks'] ?? null,
                'review'           => $data['review'] ?? null,
                'sale_datetime'    => now(),
                'is_active'        => true,
            ]);

            $this->syncItems($sale, $data['items']);
            $sale->load('items');
            $sale->calculateTotals();

            return $sale;
        });
    }

    public function update($id, array $data): Sale
    {
        return DB::transaction(function () use ($id, $data) {
            $sale = Sale::findOrFail($id);

            $sale->update([
                'order_id'         => $data['order_id'],
                'customer_id'      => $data['customer_id'],
                'invoice_discount' => $data['invoice_discount'] ?? 0,
                'vat'              => $data['vat'] ?? 0,
                'vat_percent'      => $data['vat_percent'] ?? null,
                'shipping_charges' => $data['shipping_charges'] ?? 0,
                'delivery_status'  => $data['delivery_status'],
                'payment_status'   => $data['payment_status'],
                'payment_type'     => $data['payment_type'] ?? null,
                'payment_timestamp'=> $data['payment_timestamp'] ?? null,
                'shipping_method'  => $data['shipping_method'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'shipping_response'=> $data['shipping_response'] ?? null,
                'delivery_datetime'=> $data['delivery_datetime'] ?? null,
                'remarks'          => $data['remarks'] ?? null,
                'review'           => $data['review'] ?? null,
            ]);

            $sale->items()->delete();
            $this->syncItems($sale, $data['items']);
            $sale->load('items');
            $sale->calculateTotals();

            return $sale;
        });
    }

    public function delete($id): bool
    {
        return DB::transaction(function () use ($id) {
            $sale = Sale::findOrFail($id);
            $sale->items()->delete();
            return $sale->delete();
        });
    }

    public function updateDeliveryStatus($id, array $data): Sale
    {
        $sale = Sale::findOrFail($id);
        $sale->update([
            'delivery_status'   => $data['delivery_status'],
            'delivery_datetime' => $data['delivery_datetime'] ?? now(),
        ]);
        return $sale;
    }

    public function updatePaymentStatus($id, array $data): Sale
    {
        $sale = Sale::findOrFail($id);
        $sale->update([
            'payment_status'    => $data['payment_status'],
            'payment_timestamp' => $data['payment_timestamp'] ?? now(),
        ]);
        return $sale;
    }

    public function getStats(): array
    {
        return [
            'total'        => Sale::count(),
            'pending'      => Sale::where('delivery_status', 'pending')->count(),
            'processing'   => Sale::where('delivery_status', 'processing')->count(),
            'delivered'    => Sale::where('delivery_status', 'delivered')->count(),
            'totalRevenue' => Sale::where('payment_status', 'paid')->sum('grand_total'),
        ];
    }

    public function getProductsForForm(): \Illuminate\Support\Collection
    {
        return Product::with('variants')
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'unit'])
            ->map(function ($p) {
                return [
                    'id'       => $p->id,
                    'name'     => $p->name,
                    'sku'      => $p->sku,
                    'unit'     => $p->unit,
                    'price'    => 0,
                    'stock'    => ProductStock::where('product_id', $p->id)
                                     ->whereNull('product_variant_id')
                                     ->value('quantity') ?? 0,
                    'variants' => $p->variants->map(fn ($v) => [
                        'id'    => $v->id,
                        'name'  => collect($v->attributes ?? [])->values()->join(' / ') ?: $v->value,
                        'sku'   => $v->sku,
                        'price' => $v->sale_price ?? $v->price ?? 0,
                        'stock' => ProductStock::where('product_id', $p->id)
                                       ->where('product_variant_id', $v->id)
                                       ->value('quantity') ?? 0,
                    ]),
                ];
            });
    }

    private function syncItems(Sale $sale, array $items): void
    {
        foreach ($items as $item) {
            if (empty($item['product_id'])) continue;

            $product = Product::find($item['product_id']);
            $variant = !empty($item['product_variant_id'])
                ? ProductVariant::find($item['product_variant_id'])
                : null;

            $qty      = (int) $item['quantity'];
            $price    = (float) $item['price'];
            $discount = (float) ($item['discount'] ?? 0);

            $sale->items()->create([
                'product_id'         => $item['product_id'],
                'product_variant_id' => $item['product_variant_id'] ?? null,
                'quantity'           => $qty,
                'price'              => $price,
                'discount'           => $discount,
                'subtotal'           => ($price * $qty) - $discount,
                'meta'               => [
                    'product_name' => $product?->name,
                    'sku'          => $product?->sku,
                    'variant_name' => $variant
                        ? collect($variant->attributes ?? [])->values()->join(' / ') ?: $variant->value
                        : null,
                ],
            ]);
        }
    }
}