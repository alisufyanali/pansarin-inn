<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariant;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::pluck('id');
        $products  = Product::pluck('id');

        if ($customers->isEmpty() || $products->isEmpty()) {
            $this->command->warn('Customers or Products table is empty. Seeder skipped.');
            return;
        }

        for ($i = 1; $i <= 5; $i++) {

            $customerId = $customers->random();

            $order = Order::create([
                'customer_id'       => $customerId,
                'order_number'      => 'ORD-' . strtoupper(Str::random(8)),
                'subtotal'          => 0,
                'product_discount'  => 0,
                'invoice_discount'  => 0,
                'shipping_charges'  => 200,
                'tax'               => 0,
                'grand_total'       => 0,
                'status'            => 'pending',
                'payment_method'    => 'cash',
                'payment_status'    => 'unpaid',
                'shipping_address'  => 'Karachi, Pakistan',
                'billing_address'   => 'Karachi, Pakistan',
            ]);

            $subtotal = 0;

            // Create 2–4 order items per order
            $itemsCount = rand(2, 4);

            for ($j = 1; $j <= $itemsCount; $j++) {

                $productId = $products->random();
                $quantity  = rand(1, 3);
                $price     = rand(500, 3000);
                $discount  = rand(0, 200);

                $itemSubtotal = ($price * $quantity) - $discount;
                $subtotal += $itemSubtotal;

                $variantId = ProductVariant::where('product_id', $productId)->value('id');

                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_id'         => $productId,
                    'product_variant_id' => $variantId,
                    'quantity'           => $quantity,
                    'price'              => $price,
                    'discount'           => $discount,
                    'subtotal'           => $itemSubtotal,
                    'meta' => [
                        'product_name' => 'Sample Product',
                        'sku'          => 'SKU-' . rand(1000, 9999),
                    ],
                ]);
            }

            $tax = $subtotal * 0.05;

            $order->update([
                'subtotal'    => $subtotal,
                'tax'         => $tax,
                'grand_total' => $subtotal + $tax + $order->shipping_charges,
            ]);
        }
    }
}
