<?php

namespace Database\Seeders;

use App\Models\Slide;
use Illuminate\Database\Seeder;

class SlideSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            // Desktop slides
            ['type' => 'desktop', 'title' => 'Pure Herbal Products',       'subtitle' => 'Discover the power of nature with our premium herbal collection',  'image' => 'slides/desktop-1.jpg', 'btn_text' => 'Shop Now',     'btn_url' => '/shop',          'sort_order' => 1, 'is_active' => true],
            ['type' => 'desktop', 'title' => 'Kalonji — Black Seed Oil',   'subtitle' => 'The miracle herb used for centuries in traditional medicine',       'image' => 'slides/desktop-2.jpg', 'btn_text' => 'Learn More',   'btn_url' => '/products/kalonji', 'sort_order' => 2, 'is_active' => true],
            ['type' => 'desktop', 'title' => 'Summer Sale — Up to 25% Off','subtitle' => 'Limited time offer on selected herbal products',                    'image' => 'slides/desktop-3.jpg', 'btn_text' => 'View Deals',   'btn_url' => '/deals',         'sort_order' => 3, 'is_active' => true],
            ['type' => 'desktop', 'title' => 'Free Delivery on Rs.1500+',  'subtitle' => 'Order above Rs.1500 and get free delivery across Pakistan',         'image' => 'slides/desktop-1.jpg', 'btn_text' => 'Order Now',    'btn_url' => '/shop',          'sort_order' => 4, 'is_active' => false],

            // Mobile slides
            ['type' => 'mobile',  'title' => 'Pure Herbal Products',       'subtitle' => 'Premium quality herbs delivered to your door',                      'image' => 'slides/mobile-1.png', 'btn_text' => 'Shop Now',     'btn_url' => '/shop',          'sort_order' => 1, 'is_active' => true],
            ['type' => 'mobile',  'title' => 'Kalonji Oil',                'subtitle' => 'The miracle herb for health & wellness',                            'image' => 'slides/mobile-2.png', 'btn_text' => 'Buy Now',      'btn_url' => '/products/kalonji', 'sort_order' => 2, 'is_active' => true],
            ['type' => 'mobile',  'title' => 'Summer Sale 25% Off',        'subtitle' => 'Limited time offer on herbal products',                             'image' => 'slides/mobile-3.png', 'btn_text' => 'View Deals',   'btn_url' => '/deals',         'sort_order' => 3, 'is_active' => true],
        ];

        foreach ($slides as $slide) {
            Slide::firstOrCreate(
                ['type' => $slide['type'], 'title' => $slide['title']],
                $slide
            );
        }

        $this->command->info('Slides seeded successfully!');
    }
}
