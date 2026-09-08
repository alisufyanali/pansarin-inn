<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Database\Seeder;

class ProductReviewSeeder extends Seeder
{
    /**
     * @var array<int, array{name: string, email: string}>
     */
    private array $customers = [
        ['name' => 'Ayesha Khan', 'email' => 'ayesha.khan@example.test'],
        ['name' => 'Muhammad Usman', 'email' => 'usman.ahmed@example.test'],
        ['name' => 'Fatima Noor', 'email' => 'fatima.noor@example.test'],
        ['name' => 'Hassan Raza', 'email' => 'hassan.raza@example.test'],
        ['name' => 'Maryam Siddiqui', 'email' => 'maryam.s@example.test'],
        ['name' => 'Ali Hamza', 'email' => 'ali.hamza@example.test'],
        ['name' => 'Zainab Iqbal', 'email' => 'zainab.iqbal@example.test'],
        ['name' => 'Bilal Sheikh', 'email' => 'bilal.sheikh@example.test'],
        ['name' => 'Hira Javed', 'email' => 'hira.javed@example.test'],
        ['name' => 'Saad Ahmed', 'email' => 'saad.ahmed@example.test'],
        ['name' => 'Mehwish Tariq', 'email' => 'mehwish.tariq@example.test'],
        ['name' => 'Danish Ali', 'email' => 'danish.ali@example.test'],
    ];

    public function run(): void
    {
        /*
         * Delete ONLY dummy reviews.
         *
         * Real/customer reviews are NOT touched.
         */
        $deleted = ProductReview::where(
            'order_number',
            'like',
            'DUMMY-%'
        )->delete();

        $this->command->info(
            "Deleted {$deleted} existing dummy reviews."
        );

        $products = Product::with('category:id,name')->get();

        if ($products->isEmpty()) {
            $this->command->warn(
                'No products found. Seed products before product reviews.'
            );

            return;
        }

        $created = 0;

        foreach ($products as $product) {

            /*
             * Every product gets between 3 and 5 reviews.
             * Minimum is ALWAYS 3.
             */
            $targetReviews = random_int(3, 5);

            for ($slot = 1; $slot <= $targetReviews; $slot++) {

                $customer = $this->customers[
                    ($product->id + $slot) % count($this->customers)
                ];

                /*
                 * Rating distribution:
                 *
                 * 5 stars ≈ 55%
                 * 4 stars ≈ 35%
                 * 3 stars ≈ 10%
                 *
                 * 1 and 2 stars are completely excluded.
                 */
                $rating = $this->weightedRating();

                ProductReview::create([
                    'product_id' => $product->id,

                    'order_number' =>
                        "DUMMY-REVIEW-{$product->id}-{$slot}",

                    'user_id' => null,

                    'customer_name' => $customer['name'],

                    'customer_email' => $customer['email'],

                    'title' => $this->titleFor($rating),

                    'rating' => $rating,

                    'comment' => $this->commentFor(
                        $product,
                        $rating,
                        $slot
                    ),

                    'images' => null,

                    'helpful_count' => random_int(0, 24),

                    /*
                     * Approximately 80% verified.
                     */
                    'is_verified' => random_int(1, 10) <= 8,

                    'status' => true,

                    /*
                     * Approximately 30% receive admin reply.
                     */
                    'admin_reply' =>
                        (($product->id + $slot) % 10 < 3)
                            ? 'Thank you for your feedback! We appreciate you taking the time to share your experience with us.'
                            : null,

                    'admin_replied_at' =>
                        (($product->id + $slot) % 10 < 3)
                            ? now()->subDays(random_int(1, 30))
                            : null,

                    /*
                     * Random date within the last 6 months.
                     */
                    'created_at' =>
                        now()
                            ->subDays(random_int(1, 180))
                            ->subMinutes(random_int(0, 1439)),

                    'updated_at' => now(),
                ]);

                $created++;
            }
        }

        $this->command->info(
            "Created {$created} realistic product reviews."
        );
    }

    /**
     * Rating distribution:
     *
     * 5 stars = 11 / 20 = 55%
     * 4 stars = 7 / 20 = 35%
     * 3 stars = 2 / 20 = 10%
     *
     * Expected average:
     * (11×5 + 7×4 + 2×3) / 20 = 4.45
     */
    private function weightedRating(): int
    {
        return fake()->randomElement([
            5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5,

            4, 4, 4, 4, 4, 4, 4,

            3, 3,
        ]);
    }

    private function titleFor(int $rating): ?string
    {
        /*
         * ~40% of reviews include a title.
         */
        if (random_int(1, 10) <= 4) {
            return null;
        }

        return match (true) {

            $rating === 5 => fake()->randomElement([
                'Absolutely love it!',
                'Exceeded my expectations',
                'Highly recommended',
                'Will buy again!',
                'Excellent quality',
            ]),

            $rating === 4 => fake()->randomElement([
                'Great product',
                'Very happy with this',
                'Good quality',
                'Solid purchase',
                'Worth the price',
            ]),

            $rating === 3 => fake()->randomElement([
                'Decent product',
                'Average quality',
                'Okay for the price',
                'Good but can improve',
            ]),

            default => 'Good product',
        };
    }

    private function commentFor(
        Product $product,
        int $rating,
        int $slot
    ): string {

        $category = $product->category?->name ?? 'herbal wellness';

        $productName = $product->name;

        $usage = [
            "I have added {$productName} to my regular {$category} routine and the quality feels fresh.",

            "Used this {$category} item at home for a few weeks. {$productName} was neatly packed and easy to use.",

            "The aroma and texture of {$productName} were what I expected from a good {$category} product.",

            "Bought {$productName} for our family's {$category} needs. It arrived fresh and the instructions were clear.",
        ][($product->id + $slot) % 4];

        return match (true) {

            $rating === 5 =>
                "{$usage} Mashallah, it has become a repeat purchase for us.",

            $rating === 4 =>
                "{$usage} Very satisfied overall; I would order it again.",

            $rating === 3 =>
                "{$usage} It was decent overall, although the packaging could be improved slightly.",

            default =>
                "{$usage} Overall, it was a good experience.",
        };
    }
}