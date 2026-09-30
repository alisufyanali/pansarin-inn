<?php

namespace Database\Seeders;

use App\Models\Deal;
use App\Models\Product;
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
            [
                'title'               => 'Herbal Combo — 15% Off',
                'slug'                => 'herbal-combo-15-off',
                'description'         => 'Buy the whole combo together and save 15% on every item.',
                'deal_type'           => 'bundle',
                'discount_value'      => 15,
                'min_quantity'        => 1,
                'free_quantity'       => 0,
                'min_purchase_amount' => 0,
                'max_uses'            => null,
                'badge_text'          => 'COMBO 15% OFF',
                'badge_color'         => '#ea580c',
                'is_featured'         => true,
                'is_active'           => true,
                'starts_at'           => now(),
                'ends_at'             => now()->addMonths(3),
            ],
        ];

        // Products per deal (active featured products first). Bulk Order has none:
        // its "fixed" type takes Rs 500 off EACH unit, which is not what it says.
        $productCounts = [
            'buy-2-get-1-free'    => [0, 4],
            'summer-sale-20-off'  => [4, 6],
            'herbal-combo-15-off' => [10, 3],
        ];
        $pool = Product::where('status', true)
            ->whereHas('variants', fn ($q) => $q->where('status', true))
            ->orderByDesc('featured')->orderBy('id')
            ->take(13)->pluck('id');

        foreach ($deals as $data) {
            $deal = Deal::firstOrCreate(['slug' => $data['slug']], $data);

            // A deal without products is hidden on the storefront — only fill empty ones
            [$offset, $count] = $productCounts[$data['slug']] ?? [0, 0];
            if ($count > 0 && ! $deal->products()->exists()) {
                $deal->products()->sync($pool->slice($offset, $count)->values()->all());
            }
        }

        $this->command->info('Deals seeded successfully!');
    }
}
