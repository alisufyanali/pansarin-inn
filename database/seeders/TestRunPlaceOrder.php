<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TestRunPlaceOrder extends Seeder
{
    public function run(): void
    {
        // 1. Pehle User dhoondhen
        $user = User::where('email', 'referral1@example.com')->first();
        $product = Product::where('status', 1)->first();

        if (!$user || !$product) {
            $this->command->error('Test User ya Product nahi mila!');
            return;
        }

        // 2. Foreign Key error se bachne ke liye Customer record banayen ya dhoondhen
        // Hum check kar rahe hain ke kya is User ID ka koi Customer pehle se hai?
        $customer = Customer::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '0000000000',
                'address' => 'Test Address, Karachi',
            ]
        );

        // 3. Ab Order create karein (Customer ID use karte hue)
        $order = Order::create([
            'customer_id'      => $customer->id, // Yeh ab 'customers' table ki valid ID hogi
            'order_number'     => 'ORD-TEST-' . strtoupper(Str::random(5)),
            'subtotal'         => 0,
            'product_discount' => 0,
            'invoice_discount' => 0,
            'shipping_charges' => 200,
            'tax'              => 0,
            'grand_total'      => 0,
            'status'           => 'pending',
            'payment_method'   => 'cash',
            'payment_status'   => 'unpaid',
            'shipping_address' => 'Referral House, Karachi',
            'billing_address'  => 'Referral House, Karachi',
        ]);

        // 4. Order Item Logic
        $price = $product->sale_price ?? 1000;
        $variantId = ProductVariant::where('product_id', $product->id)->value('id');

        OrderItem::create([
            'order_id'           => $order->id,
            'product_id'         => $product->id,
            'product_variant_id' => $variantId,
            'quantity'           => 1,
            'price'              => $price,
            'discount'           => 0,
            'subtotal'           => $price,
            'meta'               => [
                'product_name' => $product->name,
                'sku'          => 'TEST-SKU',
            ],
        ]);

        // 5. Totals Update
        $tax = $price * 0.05;
        $order->update([
            'subtotal'    => $price,
            'tax'         => $tax,
            'grand_total' => $price + $tax + 200,
        ]);

        $this->command->info("Success: Order created for Customer ID: {$customer->id}");
    }
}