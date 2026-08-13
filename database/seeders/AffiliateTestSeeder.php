<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Affiliate;
use App\Services\AffiliateService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AffiliateTestSeeder extends Seeder
{
    public function run(AffiliateService $affiliateService): void
    {
        // 1. Referral User ko dhoonden (referral1@example.com)
        $user = User::where('email', 'referral1@example.com')->first();
        
        if (!$user) {
            $this->command->error('Referral user not found. Pehle AdminSeeder run karein.');
            return;
        }

        // 2. Customer profile dhoonden ya banayen
        $customer = Customer::firstOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => $user->name,
                'email'      => $user->email,
                'phone'      => '+92 304 5779900',
                'status'     => 'active'
            ]
        );

        // 3. Aik Dummy Order create karein
        $order = Order::create([
            'customer_id'      => $customer->id,
            'order_number'     => 'ORD-' . strtoupper(Str::random(8)),
            'subtotal'         => 1000.00, 
            'shipping_charges' => 150.00,
            'tax'              => 50.00,
            'grand_total'      => 1200.00,
            'status'           => 'pending',
            'payment_status'   => 'unpaid',
            'shipping_address' => 'Test Street, Karachi',
            'payment_method'   => 'COD',
        ]);

        $this->command->info("Order Created: {$order->order_number}");

        // 4. Status ko 'delivered' mark karein
        $order->update([
            'status' => 'delivered',
            'payment_status' => 'paid'
        ]);

        // 5. Affiliate Service Trigger karein
        // Ye wahi method hai jo aapke OrderController ke update mein call hota hai
        $affiliateService->updateReferral($order);

        // 6. Verification log
        $affiliate = Affiliate::where('user_id', $user->referred_by)->first();
        $this->command->info("Test Finished!");
        $this->command->warn("Affiliate Balance Now: " . ($affiliate ? $affiliate->balance : 'N/A'));
    }
}