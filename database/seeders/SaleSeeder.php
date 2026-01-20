<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariant;

class SaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all orders that don't have sales yet
        $orders = Order::whereDoesntHave('sale')
            ->where('status', 'delivered')
            ->with('customer', 'items.product', 'items.variant')
            ->take(5)
            ->get();

        if ($orders->isEmpty()) {
            $this->command->info('No delivered orders without sales found. Creating sample data...');
            
            // If no orders exist, create sample sales with random data
            $customers = Customer::all();
            $products = Product::with('variants')->get();

            if ($customers->isEmpty() || $products->isEmpty()) {
                $this->command->error('Please seed customers and products first!');
                return;
            }

            for ($i = 1; $i <= 5; $i++) {
                $customer = $customers->random();
                
                // Create a sample order first
                $order = Order::create([
                    'customer_id' => $customer->id,
                    'order_number' => Order::generateOrderNumber(),
                    'invoice_discount' => rand(0, 500),
                    'shipping_charges' => rand(100, 300),
                    'tax' => 0,
                    'status' => 'delivered',
                    'payment_status' => ['paid', 'unpaid', 'partially_paid'][rand(0, 2)],
                    'payment_method' => ['Cash On Delivery', 'Bank Transfer', 'Card Payment'][rand(0, 2)],
                    'shipping_method' => ['leopard', 'tcs', 'trax', 'rider'][rand(0, 3)],
                    'shipping_address' => $customer->address ?? 'Sample Address ' . $i,
                ]);

                // Add order items
                $itemsCount = rand(1, 4);
                for ($j = 0; $j < $itemsCount; $j++) {
                    $product = $products->random();
                    $variant = $product->variants->isNotEmpty() ? $product->variants->random() : null;
                    $price = $variant ? $variant->price : $product->price;
                    $quantity = rand(1, 3);
                    $discount = rand(0, 100);

                    $order->items()->create([
                        'product_id' => $product->id,
                        'product_variant_id' => $variant?->id,
                        'quantity' => $quantity,
                        'price' => $price,
                        'discount' => $discount,
                        'subtotal' => ($price * $quantity) - $discount,
                        'meta' => [
                            'product_name' => $product->name,
                            'sku' => $product->sku,
                            'variant_name' => $variant?->name,
                        ],
                    ]);
                }

                $order->calculateTotals();
                $order->refresh();

                // Now create sale for this order
                $this->createSaleFromOrder($order);
            }
        } else {
            // Create sales from existing orders
            foreach ($orders as $order) {
                $this->createSaleFromOrder($order);
            }
        }

        $this->command->info('Sales seeded successfully!');
    }

    /**
     * Create a sale from an order
     */
    private function createSaleFromOrder($order)
    {
        $paymentStatuses = ['paid', 'unpaid', 'partially_paid', 'refunded'];
        $deliveryStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
        $paymentTypes = ['cash_on_delivery', 'bank_transfer', 'card_payment', null];
        $shippingMethods = ['leopard', 'tcs', 'trax', 'rider', null];

        $sale = Sale::create([
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'sale_code' => Sale::generateSaleCode($order->order_number),
            'subtotal' => $order->subtotal,
            'product_discount' => $order->product_discount,
            'invoice_discount' => $order->invoice_discount ?? 0,
            'vat' => rand(0, 500),
            'vat_percent' => rand(0, 1) ? '18%' : null,
            'shipping_charges' => $order->shipping_charges ?? 0,
            'grand_total' => 0, // Will be calculated
            'delivery_status' => $deliveryStatuses[array_rand($deliveryStatuses)],
            'payment_status' => $order->payment_status ?? $paymentStatuses[array_rand($paymentStatuses)],
            'payment_type' => $paymentTypes[array_rand($paymentTypes)],
            'payment_timestamp' => rand(0, 1) ? now()->subDays(rand(1, 10)) : null,
            'shipping_method' => $shippingMethods[array_rand($shippingMethods)],
            'shipping_address' => $order->shipping_address ?? 'Sample shipping address for ' . $order->order_number,
            'shipping_response' => rand(0, 1) ? json_encode(['status' => 'success', 'tracking_id' => 'TRK' . rand(1000, 9999)]) : null,
            'delivery_datetime' => rand(0, 1) ? now()->addDays(rand(1, 7)) : null,
            'remarks' => rand(0, 1) ? 'Sample remarks for sale ' . $order->order_number : null,
            'review' => rand(0, 1) ? 'Great service! Customer is satisfied.' : null,
            'viewed' => rand(0, 1),
            'sale_datetime' => now()->subDays(rand(0, 30)),
            'is_active' => true,
        ]);

        // Create sale items from order items
        foreach ($order->items as $orderItem) {
            $sale->items()->create([
                'product_id' => $orderItem->product_id,
                'product_variant_id' => $orderItem->product_variant_id,
                'quantity' => $orderItem->quantity,
                'price' => $orderItem->price,
                'discount' => $orderItem->discount,
                'subtotal' => $orderItem->subtotal,
                'meta' => $orderItem->meta ?? [
                    'product_name' => $orderItem->product->name ?? 'Unknown Product',
                    'sku' => $orderItem->product->sku ?? 'N/A',
                    'variant_name' => $orderItem->variant?->name ?? null,
                ],
            ]);
        }

        // Calculate totals
        $sale->calculateTotals();

        $this->command->info("Created sale: {$sale->sale_code} for order: {$order->order_number}");
    }
}