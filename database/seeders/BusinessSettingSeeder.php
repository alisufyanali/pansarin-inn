<?php

namespace Database\Seeders;

use App\Models\BusinessSetting;
use Illuminate\Database\Seeder;

class BusinessSettingSeeder extends Seeder
{
    public function run(): void
    {
        $business_settings = [
            // --- A. Payments (Status = Toggle ON/OFF, Value = Configuration) ---
            ['type' => 'paypal_set', 'status' => 'no', 'value' => null],
            ['type' => 'paypal_email', 'status' => 'ok', 'value' => 'paypal@pansariinn.com'],
            ['type' => 'paypal_type', 'status' => 'ok', 'value' => 'sandbox'],
            
            ['type' => 'stripe_set', 'status' => 'no', 'value' => null],
            ['type' => 'stripe_secret', 'status' => 'ok', 'value' => 'sk_test_...'],
            
            ['type' => 'cash_set', 'status' => 'ok', 'value' => null], // COD Enabled
            
            // --- B. Currency & Pricing (Status usually 'ok', Value = Core Data) ---
            ['type' => 'currency_code', 'status' => 'ok', 'value' => 'PKR'],
            ['type' => 'currency_symbol', 'status' => 'ok', 'value' => 'Rs'],
            ['type' => 'currency_format', 'status' => 'ok', 'value' => 'left'],
            ['type' => 'no_of_decimals', 'status' => 'ok', 'value' => '2'],
            
            // --- C. Shipping & Order Rules ---
            ['type' => 'shipping_set', 'status' => 'ok', 'value' => null], 
            ['type' => 'shipping_cost', 'status' => 'ok', 'value' => '250'],
            ['type' => 'shipping_cost_type', 'status' => 'ok', 'value' => 'flat'],
            ['type' => 'shipment_info', 'status' => 'ok', 'value' => 'Delivery within 3-5 working days.'],
            
            // --- D. Vendor & Commission System ---
            ['type' => 'commission_set', 'status' => 'no', 'value' => null],
            ['type' => 'commission_amount', 'status' => 'ok', 'value' => '10'],
            ['type' => 'vendor_vp_set', 'status' => 'no', 'value' => null],

            // --- E. Advanced Operations ---
            ['type' => 'order_cancellation_set', 'status' => 'ok', 'value' => null],
            ['type' => 'coupon_system_set', 'status' => 'ok', 'value' => null],
            ['type' => 'business_debug', 'status' => 'no', 'value' => null],
        ];

        foreach ($business_settings as $setting) {
            BusinessSetting::updateOrCreate(
                ['type' => $setting['type']],
                [
                    'status' => $setting['status'],
                    'value' => $setting['value']
                ]
            );
        }
    }
}