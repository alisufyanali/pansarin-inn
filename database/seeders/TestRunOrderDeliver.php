<?php

namespace Database\Seeders;

use App\Models\Order;
use Illuminate\Database\Seeder;

class TestRunOrderDeliver extends Seeder
{
    public function run(): void
    {
        // 1. referral1@example.com ka sab se naya pending order uthayen
        $order = Order::whereHas('customer', function($q) {
            $q->where('email', 'referral1@example.com');
        })->where('status', 'pending')->latest()->first();

        if (!$order) {
            $this->command->warn('referral1@example.com ka koi pending order nahi mila!');
            return;
        }

        // 2. Status change karein (Admin Action simulation)
        $order->update([
            'status'         => 'delivered',
            'payment_status' => 'paid'
        ]);

        // Note: Agar aapne Order Model mein Observer ya Logic lagayi hui hai 
        // to yahan se Affiliate Commission trigger ho jana chahiye.

        $this->command->info("Order {$order->order_number} status updated to DELIVERED and PAID.");
    }
}