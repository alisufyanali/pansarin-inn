<?php

namespace App\Http\Repositories\Admin;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SaleRepository
{
    /**
     * Get all sales
     */
    public function getAll()
    {
        return Sale::with(['customer', 'order'])->latest()->get();
    }

    /**
     * Get all sales for DataTable
     */
    public function getAllForDataTable($request)
    {
        $query = Sale::with(['customer', 'order'])->latest();

        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('sale_code', 'like', "%{$search}%")
                        ->orWhere('delivery_status', 'like', "%{$search}%")
                        ->orWhere('payment_status', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            } elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (! empty($search)) {
                    $query->where(function ($q) use ($search) {
                        $q->where('sale_code', 'like', "%{$search}%")
                            ->orWhere('delivery_status', 'like', "%{$search}%")
                            ->orWhere('payment_status', 'like', "%{$search}%")
                            ->orWhereHas('customer', function ($q) use ($search) {
                                $q->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('last_name', 'like', "%{$search}%")
                                    ->orWhere('phone', 'like', "%{$search}%");
                            });
                    });
                }
            }
        }

        // Filters
        if ($request->has('delivery_status') && $request->delivery_status !== '') {
            $query->where('delivery_status', $request->delivery_status);
        }

        if ($request->has('payment_status') && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }

        return $query;
    }

    /**
     * Find sale by ID
     */
    public function find($id)
    {
        return Sale::with(['customer', 'order', 'items.product', 'items.variant'])->findOrFail($id);
    }

    /**
     * Create new sale
     */
    public function store(array $data)
    {
        DB::beginTransaction();
        try {
            // Get order
            $order = Order::findOrFail($data['order_id']);

            // Create sale
            $sale = Sale::create([
                'order_id' => $data['order_id'],
                'customer_id' => $data['customer_id'],
                'sale_code' => Sale::generateSaleCode($order->order_number),
                'invoice_discount' => $data['invoice_discount'] ?? 0,
                'vat' => $data['vat'] ?? 0,
                'vat_percent' => $data['vat_percent'] ?? null,
                'shipping_charges' => $data['shipping_charges'] ?? 0,
                'delivery_status' => $data['delivery_status'],
                'payment_status' => $data['payment_status'],
                'payment_type' => $data['payment_type'] ?? null,
                'payment_timestamp' => $data['payment_timestamp'] ?? null,
                'shipping_method' => $data['shipping_method'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'shipping_response' => $data['shipping_response'] ?? null,
                'delivery_datetime' => $data['delivery_datetime'] ?? null,
                'remarks' => $data['remarks'] ?? null,
                'review' => $data['review'] ?? null,
                'sale_datetime' => now(),
                'is_active' => true,
            ]);

            // Create sale items
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                $variant = isset($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                $subtotal = ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);

                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $subtotal,
                    'meta' => [
                        'product_name' => $product->name,
                        'sku' => $product->sku,
                        'variant_name' => $variant?->name ?? null,
                    ],
                ]);
            }

            // Calculate totals
            $sale->calculateTotals();

            DB::commit();

            return $sale;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create sale: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update sale
     */
    public function update($id, array $data)
    {
        DB::beginTransaction();
        try {
            $sale = Sale::findOrFail($id);

            // Update sale
            $sale->update([
                'order_id' => $data['order_id'],
                'customer_id' => $data['customer_id'],
                'invoice_discount' => $data['invoice_discount'] ?? 0,
                'vat' => $data['vat'] ?? 0,
                'vat_percent' => $data['vat_percent'] ?? null,
                'shipping_charges' => $data['shipping_charges'] ?? 0,
                'delivery_status' => $data['delivery_status'],
                'payment_status' => $data['payment_status'],
                'payment_type' => $data['payment_type'] ?? null,
                'payment_timestamp' => $data['payment_timestamp'] ?? null,
                'shipping_method' => $data['shipping_method'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'shipping_response' => $data['shipping_response'] ?? null,
                'delivery_datetime' => $data['delivery_datetime'] ?? null,
                'remarks' => $data['remarks'] ?? null,
                'review' => $data['review'] ?? null,
            ]);

            // Delete old items
            $sale->items()->delete();

            // Create new items
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                $variant = isset($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                $subtotal = ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);

                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $subtotal,
                    'meta' => [
                        'product_name' => $product->name,
                        'sku' => $product->sku,
                        'variant_name' => $variant?->name ?? null,
                    ],
                ]);
            }

            // Recalculate totals
            $sale->calculateTotals();

            DB::commit();

            return $sale;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update sale: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete sale
     */
    public function delete($id)
    {
        try {
            return Sale::destroy($id);
        } catch (\Exception $e) {
            Log::error('Failed to delete sale: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update delivery status
     */
    public function updateDeliveryStatus($id, array $data)
    {
        try {
            $sale = Sale::findOrFail($id);
            $sale->update([
                'delivery_status' => $data['delivery_status'],
                'delivery_datetime' => $data['delivery_datetime'] ?? now(),
            ]);

            return $sale;
        } catch (\Exception $e) {
            Log::error('Failed to update delivery status: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus($id, array $data)
    {
        try {
            $sale = Sale::findOrFail($id);
            $sale->update([
                'payment_status' => $data['payment_status'],
                'payment_timestamp' => $data['payment_timestamp'] ?? now(),
            ]);

            return $sale;
        } catch (\Exception $e) {
            Log::error('Failed to update payment status: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get stats
     */
    public function getStats()
    {
        return [
            'total' => Sale::count(),
            'pending' => Sale::where('delivery_status', 'pending')->count(),
            'processing' => Sale::where('delivery_status', 'processing')->count(),
            'delivered' => Sale::where('delivery_status', 'delivered')->count(),
            'totalRevenue' => Sale::where('payment_status', 'paid')->sum('grand_total'),
        ];
    }
}
