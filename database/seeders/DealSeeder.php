<?php

namespace Database\Seeders;

use App\Models\Deal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DealSeeder extends Seeder
{
    public function run(): void
    {
        $deals = [
            [
                'title'               => 'Buy 2 Get 1 Free',
                'slug'                => 'buy-2-get-1-free',
                'description'         => 'Buy any 2 herbal products and get 1 free!',
                'deal_type'           => 'buy_x_get_y',
                'discount_value'      => 0,
                'min_quantity'        => 2,
                'free_quantity'       => 1,
                'min_purchase_amount' => 0,
                'max_uses'            => 500,
                'badge_text'          => 'BOGO',
                'badge_color'         => '#16a34a',
                'is_featured'         => true,
                'is_active'           => true,
                'starts_at'           => now(),
                'ends_at'             => now()->addMonths(3),
            ],
            [
                'title'               => 'Summer Sale — 20% Off',
                'slug'                => 'summer-sale-20-off',
                'description'         => 'Get 20% off on all products this summer.',
                'deal_type'           => 'percentage',
                'discount_value'      => 20,
                'min_quantity'        => 1,
                'free_quantity'       => 0,
                'min_purchase_amount' => 500,
                'max_uses'            => 1000,
                'badge_text'          => '20% OFF',
                'badge_color'         => '#dc2626',
                'is_featured'         => true,
                'is_active'           => true,
                'starts_at'           => now(),
                'ends_at'             => now()->addMonths(2),
            ],
            [
                'title'               => 'Bulk Order Discount',
                'slug'                => 'bulk-order-discount',
                'description'         => 'Order 5 or more items and get Rs.500 off.',
                'deal_type'           => 'fixed',
                'discount_value'      => 500,
                'min_quantity'        => 5,
                'free_quantity'       => 0,
                'min_purchase_amount' => 2000,
                'max_uses'            => 200,
                'badge_text'          => 'BULK',
                'badge_color'         => '#7c3aed',
                'is_featured'         => false,
                'is_active'           => true,
                'starts_at'           => now(),
                'ends_at'             => now()->addMonths(6),
            ],
        ];

        foreach ($deals as $deal) {
            Deal::firstOrCreate(['slug' => $deal['slug']], $deal);
        }

        $this->command->info('Deals seeded successfully!');
    }
}
