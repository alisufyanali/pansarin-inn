<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\AffiliateService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(AffiliateService $affiliateService): void
    {
        $customers = Customer::all(); 
        $products = Product::all();

        if ($customers->isEmpty() || $products->isEmpty()) {
            $this->command->warn('Customers or Products table is empty. Seeder skipped.');
            return;
        }

        // --- PART 1: 10 RANDOM ORDERS (FOR GENERAL TESTING) ---
        for ($i = 1; $i <= 10; $i++) {
            $customer = $customers->random();
            $this->createOrderWithItems($customer, $products, $affiliateService);
        }

        // --- PART 2: SPECIFIC REFERRAL HISTORY (FOR DASHBOARD TESTING) ---
        $referralUsers = User::whereNotNull('referred_by')->get();

        foreach ($referralUsers as $refUser) {
            $customer = Customer::where('user_id', $refUser->id)->first();
            if (!$customer) continue;

            // Har referral user ke liye 3-5 confirmed delivered orders
            $historyCount = rand(3, 5);
            for ($k = 0; $k < $historyCount; $k++) {
                $this->createOrderWithItems($customer, $products, $affiliateService, true);
            }
        }

        $this->command->info('Orders and Referral History seeded successfully!');
    }

    /**
     * Helper function to create order and items
     */
    private function createOrderWithItems($customer, $products, $affiliateService, $forceDelivered = false)
    {
        $status = $forceDelivered ? 'delivered' : ((rand(1, 10) > 3) ? 'delivered' : 'pending');

        $order = Order::create([
            'customer_id' => $customer->id,
            'order_number' => 'ORD-' . strtoupper(Str::random(8)),
            'subtotal' => 0,
            'product_discount' => 0,
            'invoice_discount' => 0,
            'shipping_charges' => 200,
            'tax' => 0,
            'grand_total' => 0,
            'status' => $status,
            'payment_method' => 'cash',
            'payment_status' => ($status === 'delivered') ? 'paid' : 'unpaid',
            'shipping_address' => 'Karachi, Pakistan',
            'billing_address' => 'Karachi, Pakistan',
        ]);

        $subtotal = 0;
        $itemsCount = rand(2, 4);

        for ($j = 1; $j <= $itemsCount; $j++) {
            $product = $products->random();
            $quantity = rand(1, 3);
            $price = (float) (ProductVariant::where('product_id', $product->id)->min('price') ?: 100); // derive from variants; fallback to 100
            $discount = rand(0, min(50, (int)($price * $quantity)));

            $itemSubtotal = ($price * $quantity) - $discount;
            $subtotal += $itemSubtotal;

            $variantId = ProductVariant::where('product_id', $product->id)->value('id');

            // If variant exists, use variant price
            if ($variantId) {
                $variantPrice = ProductVariant::find($variantId)?->price;
                if ($variantPrice) {
                    $price = (float) $variantPrice;
                    $itemSubtotal = ($price * $quantity) - $discount;
                    $subtotal = $subtotal - (($price * $quantity) - $discount) + $itemSubtotal;
                }
            }

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'price' => $price,
                'discount' => $discount,
                'subtotal' => $itemSubtotal,
                'meta' => [
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                ],
            ]);
        }

        $tax =  0;
        $grandTotal = $subtotal + $tax + $order->shipping_charges;

        $order->update([
            'subtotal' => $subtotal,
            'tax' => $tax,
            'grand_total' => $grandTotal,
        ]);

        // Trigger affiliate logic if delivered
        if ($order->status === 'delivered') {
            $affiliateService->updateReferral($order);
        }
    }
}