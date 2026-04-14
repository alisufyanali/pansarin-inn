<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductReviewSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::take(5)->pluck('id')->toArray();
        if (empty($products)) {
            $this->command->warn('No products found. Run ProductsSeeder first.');
            return;
        }

        $reviews = [
            ['customer_name' => 'Ali Hassan',      'customer_email' => 'ali@gmail.com',    'rating' => 5, 'comment' => 'Excellent quality! Very fresh and effective herbs. Highly recommended.', 'is_verified' => true,  'status' => true],
            ['customer_name' => 'Sara Ahmed',       'customer_email' => 'sara@yahoo.com',   'rating' => 4, 'comment' => 'Good product, fast delivery. Will order again.',                         'is_verified' => true,  'status' => true],
            ['customer_name' => 'Usman Khan',       'customer_email' => 'usman@gmail.com',  'rating' => 5, 'comment' => 'Mashallah, very pure and natural. Noticed results within a week.',       'is_verified' => true,  'status' => true],
            ['customer_name' => 'Fatima Malik',     'customer_email' => 'fatima@gmail.com', 'rating' => 3, 'comment' => 'Average product. Packaging could be better.',                            'is_verified' => false, 'status' => false],
            ['customer_name' => 'Bilal Raza',       'customer_email' => 'bilal@gmail.com',  'rating' => 5, 'comment' => 'Best herbal store in Pakistan! Quality is top notch.',                   'is_verified' => true,  'status' => true],
            ['customer_name' => 'Ayesha Siddiqui',  'customer_email' => 'ayesha@gmail.com', 'rating' => 4, 'comment' => 'Very satisfied with the product. Natural and effective.',                 'is_verified' => true,  'status' => true],
            ['customer_name' => 'Hamza Tariq',      'customer_email' => 'hamza@yahoo.com',  'rating' => 2, 'comment' => 'Not as described. Expected better quality.',                              'is_verified' => false, 'status' => false],
            ['customer_name' => 'Zainab Noor',      'customer_email' => 'zainab@gmail.com', 'rating' => 5, 'comment' => 'Amazing! My whole family uses Pansari Inn products now.',                'is_verified' => true,  'status' => true],
        ];

        foreach ($reviews as $i => $review) {
            DB::table('product_reviews')->insertOrIgnore(array_merge($review, [
                'product_id'   => $products[$i % count($products)],
                'order_number' => 'ORD-SEED-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'created_at'   => now()->subDays(rand(1, 60)),
                'updated_at'   => now(),
            ]));
        }

        $this->command->info('Product reviews seeded successfully!');
    }
}
