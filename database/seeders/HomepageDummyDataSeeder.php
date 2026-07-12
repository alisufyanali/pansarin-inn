<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\HomepageCategoryProduct;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Database\Seeder;

class HomepageDummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── STEP 1: Featured Products ──────────────────────────────
        $featuredCount = 0;

        // First clear any existing featured flags so we get a clean set
        Product::where('featured', true)->update(['featured' => false]);

        $featured = Product::where('status', true)
            ->inRandomOrder()
            ->limit(8)
            ->get();

        foreach ($featured as $product) {
            $product->update(['featured' => true]);
            $featuredCount++;
        }

        $this->command->info("✓ Featured products: {$featuredCount} marked");

        // ── STEP 2: Category Products ──────────────────────────────
        $categoriesSeeded = 0;
        $categoryProductsInserted = 0;

        $categories = Category::where('status', true)
            ->whereHas('products', fn ($q) => $q->where('status', true))
            ->get();

        foreach ($categories as $category) {
            $products = Product::where('category_id', $category->id)
                ->where('status', true)
                ->inRandomOrder()
                ->limit(6)
                ->get();

            if ($products->isEmpty()) continue;

            foreach ($products as $index => $product) {
                HomepageCategoryProduct::firstOrCreate(
                    [
                        'category_id' => $category->id,
                        'product_id'  => $product->id,
                    ],
                    ['sort_order' => $index]
                );
                $categoryProductsInserted++;
            }

            $categoriesSeeded++;
        }

        $this->command->info("✓ Category products: {$categoriesSeeded} categories, {$categoryProductsInserted} product rows");

        // ── STEP 3: Video Products ─────────────────────────────────
        $videoCount = 0;

        // Clear existing dummy video URLs first (won't touch real ones)
        Product::where('video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ->update(['video' => null]);

        $videoProducts = Product::where('status', true)
            ->whereNull('video')
            ->inRandomOrder()
            ->limit(6)
            ->get();

        foreach ($videoProducts as $product) {
            $product->update(['video' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ']);
            $videoCount++;
        }

        $this->command->info("✓ Video products: {$videoCount} products assigned video URL");

        // ── STEP 4: Homepage Reviews ───────────────────────────────
        $reviewCount = 0;

        // First try: mark existing approved reviews as show_on_homepage
        $existingReviews = ProductReview::where('status', true)
            ->inRandomOrder()
            ->limit(8)
            ->get();

        if ($existingReviews->count() >= 4) {
            foreach ($existingReviews as $review) {
                $review->update(['show_on_homepage' => true]);
                $reviewCount++;
            }
            $this->command->info("✓ Homepage reviews: {$reviewCount} existing reviews marked show_on_homepage=true");
        } else {
            // No reviews — create dummy ones using existing products
            $sampleComments = [
                'Amazing quality, will order again!',
                'Fast delivery and authentic product.',
                'Highly recommend to everyone.',
                'Great customer service and product quality.',
                'Exactly what I needed, very satisfied.',
                'Best herbal products in Pakistan.',
                'Packaging was excellent, product is genuine.',
                'Will definitely buy from Pansari Inn again.',
            ];

            $reviewProducts = Product::where('status', true)
                ->inRandomOrder()
                ->limit(8)
                ->get();

            foreach ($reviewProducts as $index => $product) {
                ProductReview::create([
                    'product_id'       => $product->id,
                    'user_id'          => null,
                    'customer_name'    => 'Verified Customer',
                    'customer_email'   => null,
                    'order_number'     => null,
                    'rating'           => rand(4, 5),
                    'comment'          => $sampleComments[$index] ?? 'Great product!',
                    'is_verified'      => false,
                    'status'           => true,   // boolean: approved
                    'show_on_homepage' => true,
                ]);
                $reviewCount++;
            }

            $this->command->info("✓ Homepage reviews: {$reviewCount} dummy reviews created");
        }

        // ── Summary ────────────────────────────────────────────────
        $this->command->newLine();
        $this->command->info('=== HomepageDummyDataSeeder Summary ===');
        $this->command->info("  Featured products  : {$featuredCount}");
        $this->command->info("  Category products  : {$categoriesSeeded} categories, {$categoryProductsInserted} rows");
        $this->command->info("  Video products     : {$videoCount}");
        $this->command->info("  Homepage reviews   : {$reviewCount}");
        $this->command->info('Done.');
    }
}
