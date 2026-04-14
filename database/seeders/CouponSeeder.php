<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            ['code' => 'WELCOME10',  'description' => 'Welcome discount 10%',       'discount_type' => 'percentage', 'discount_value' => 10,  'apply_to' => 'order', 'min_purchase_amount' => 500,  'usage_limit' => 100, 'is_active' => true],
            ['code' => 'FLAT100',    'description' => 'Flat Rs.100 off on order',   'discount_type' => 'fixed',      'discount_value' => 100, 'apply_to' => 'order', 'min_purchase_amount' => 1000, 'usage_limit' => 50,  'is_active' => true],
            ['code' => 'HERBS20',    'description' => '20% off on all herbs',       'discount_type' => 'percentage', 'discount_value' => 20,  'apply_to' => 'order', 'min_purchase_amount' => 800,  'usage_limit' => 200, 'is_active' => true],
            ['code' => 'SUMMER15',   'description' => 'Summer sale 15% off',        'discount_type' => 'percentage', 'discount_value' => 15,  'apply_to' => 'order', 'min_purchase_amount' => 600,  'usage_limit' => 150, 'is_active' => true],
            ['code' => 'FREESHIP',   'description' => 'Free shipping coupon',       'discount_type' => 'fixed',      'discount_value' => 250, 'apply_to' => 'order', 'min_purchase_amount' => 1500, 'usage_limit' => 75,  'is_active' => true],
            ['code' => 'EID25',      'description' => 'Eid special 25% off',        'discount_type' => 'percentage', 'discount_value' => 25,  'apply_to' => 'order', 'min_purchase_amount' => 1000, 'usage_limit' => 100, 'is_active' => false],
            ['code' => 'NEWUSER50',  'description' => 'New user Rs.50 off',         'discount_type' => 'fixed',      'discount_value' => 50,  'apply_to' => 'order', 'min_purchase_amount' => 300,  'usage_limit' => 500, 'is_active' => true],
        ];

        foreach ($coupons as $coupon) {
            Coupon::firstOrCreate(['code' => $coupon['code']], $coupon);
        }

        $this->command->info('Coupons seeded successfully!');
    }
}
