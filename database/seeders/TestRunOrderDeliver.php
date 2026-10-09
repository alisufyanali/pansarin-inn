<?php

namespace Database\Seeders;

use App\Models\Order;
use Illuminate\Database\Seeder;

class TestRunOrderDeliver extends Seeder
{
    public function run(): void
    {
        // 1. Take the newest pending order of referral1@example.com
        $order = Order::whereHas('customer', function($q) {
            $q->where('email', 'referral1@example.com');
        })->where('status', 'pending')->latest()->first();

        if (!$order) {
            $this->command->warn('No pending order found for referral1@example.com!');
            return;
        }

        // 2. Change the status (simulates the admin action)
        $order->update([
            'status'         => 'delivered',
            'payment_status' => 'paid'
        ]);

        // Note: with the Order observer in place, this triggers the
        // affiliate commission.

        $this->command->info("Order {$order->order_number} status updated to DELIVERED and PAID.");
    }
}