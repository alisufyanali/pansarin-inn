<?php

namespace App\Http\Repositories\Admin;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderRepository
{
    /**
     * Get all orders
     */
    public function getAll()
    {
        return Order::with('customer')->latest()->get();
    }

    /**
     * Get all orders for DataTable
     */
    public function getAllForDataTable($request)
    {
        $query = Order::with(['customer'])->latest();

        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
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
                        $q->where('order_number', 'like', "%{$search}%")
                            ->orWhere('status', 'like', "%{$search}%")
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
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_status') && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }

        return $query;
    }

    /**
     * Find order by ID
     */
    public function find($id)
    {
        return Order::with(['customer', 'items.product', 'items.variant'])->findOrFail($id);
    }

    /**
     * Create new order
     */
    public function store(array $data)
    {
        DB::beginTransaction();
        try {
            // Create order
            $order = Order::create([
                'customer_id' => $data['customer_id'],
                'order_number' => Order::generateOrderNumber(),
                'invoice_discount' => $data['invoice_discount'] ?? 0,
                'shipping_charges' => $data['shipping_charges'] ?? 0,
                'tax' => $data['tax'] ?? 0,
                'status' => $data['status'],
                'payment_status' => $data['payment_status'],
                'payment_method' => $data['payment_method'] ?? null,
                'payment_date' => $data['payment_date'] ?? null,
                'shipping_method' => $data['shipping_method'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'billing_address' => $data['billing_address'] ?? null,
                'order_note' => $data['order_note'] ?? null,
            ]);

            // Create order items
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                $variant = isset($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                $subtotal = ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);

                $order->items()->create([
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
            $order->calculateTotals();

            DB::commit();

            return $order;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create order: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update order
     */
    public function update($id, array $data)
    {
        DB::beginTransaction();
        try {
            $order = Order::findOrFail($id);

            // Update order
            $order->update([
                'customer_id' => $data['customer_id'],
                'invoice_discount' => $data['invoice_discount'] ?? 0,
                'shipping_charges' => $data['shipping_charges'] ?? 0,
                'tax' => $data['tax'] ?? 0,
                'status' => $data['status'],
                'payment_status' => $data['payment_status'],
                'payment_method' => $data['payment_method'] ?? null,
                'payment_date' => $data['payment_date'] ?? null,
                'shipping_method' => $data['shipping_method'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'billing_address' => $data['billing_address'] ?? null,
                'order_note' => $data['order_note'] ?? null,
            ]);

            // Delete old items
            $order->items()->delete();

            // Create new items
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                $variant = isset($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                $subtotal = ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);

                $order->items()->create([
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
            $order->calculateTotals();

            DB::commit();

            return $order;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update order: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete order
     */
    public function delete($id)
    {
        try {
            return Order::destroy($id);
        } catch (\Exception $e) {
            Log::error('Failed to delete order: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update order status
     */
    public function updateStatus($id, $status)
    {
        try {
            $order = Order::findOrFail($id);
            $order->update(['status' => $status]);

            return $order->fresh();
        } catch (\Exception $e) {
            Log::error('Failed to update order status: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus($id, array $data)
    {
        try {
            $order = Order::findOrFail($id);
            $order->update([
                'payment_status' => $data['payment_status'],
                'payment_date' => $data['payment_date'] ?? now(),
            ]);

            return $order;
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
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'totalRevenue' => Order::where('payment_status', 'paid')->sum('grand_total'),
        ];
    }
}
