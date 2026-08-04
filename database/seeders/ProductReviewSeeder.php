<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Database\Seeder;

class ProductReviewSeeder extends Seeder
{
    /** @var array<int, array{name: string, email: string}> */
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
        $products = Product::with('category:id,name')->get();

        if ($products->isEmpty()) {
            $this->command->warn('No products found. Seed products before product reviews.');

            return;
        }

        $created = 0;

        foreach ($products as $product) {
            // A deterministic target keeps re-runs idempotent: every product has 3 or 4 reviews.
            $targetReviews = 3 + ($product->id % 2);
            $existingReviews = ProductReview::where('product_id', $product->id)->count();

            for ($slot = $existingReviews + 1; $slot <= $targetReviews; $slot++) {
                $customer = $this->customers[($product->id + $slot) % count($this->customers)];
                $rating = $this->weightedRating();
                $review = ProductReview::firstOrCreate(
                    [
                        'product_id'   => $product->id,
                        'order_number' => "DUMMY-REVIEW-{$product->id}-{$slot}",
                    ],
                    [
                        'user_id'        => null,
                        'customer_name'  => $customer['name'],
                        'customer_email' => $customer['email'],
                        'title'          => $this->titleFor($rating),
                        'rating'         => $rating,
                        'comment'        => $this->commentFor($product, $rating, $slot),
                        'images'         => null,
                        'helpful_count'  => random_int(0, 24),
                        'is_verified'    => random_int(1, 10) <= 8,
                        'status'         => true,
                        // ~30% of approved reviews get an admin reply
                        'admin_reply'      => (($product->id + $slot) % 10 < 3)
                            ? 'Thank you for your feedback! We appreciate you taking the time to share your experience with us.'
                            : null,
                        'admin_replied_at' => (($product->id + $slot) % 10 < 3) ? now()->subDays(random_int(1, 30)) : null,
                        'created_at'       => now()->subDays(random_int(1, 180))->subMinutes(random_int(0, 1439)),
                        'updated_at'       => now(),
                    ],
                );

                if ($review->wasRecentlyCreated) {
                    $created++;
                }
            }
        }

        $this->command->info("Created {$created} realistic product reviews.");
    }

    private function weightedRating(): int
    {
        // 79% four- or five-star, 14% three-star, 7% one- or two-star.
        return fake()->randomElement([5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 3, 3, 2, 1]);
    }

    private function titleFor(int $rating): ?string
    {
        // ~60% of reviews include a title
        if (random_int(1, 10) <= 4) return null;

        return match (true) {
            $rating === 5 => fake()->randomElement([
                'Absolutely love it!', 'Exceeded my expectations', 'Highly recommended', 'Will buy again!',
            ]),
            $rating === 4 => fake()->randomElement([
                'Great product', 'Very happy with this', 'Good quality', 'Solid purchase',
            ]),
            $rating === 3 => fake()->randomElement([
                'Decent but could be better', 'Average quality', 'Okay for the price',
            ]),
            $rating === 2 => fake()->randomElement([
                'Disappointed', 'Not what I expected',
            ]),
            default => fake()->randomElement([
                'Not satisfied', 'Would not recommend',
            ]),
        };
    }

    private function commentFor(Product $product, int $rating, int $slot): string
    {
        $category = $product->category?->name ?? 'herbal wellness';
        $productName = $product->name;
        $usage = [
            "I have added {$productName} to my regular {$category} routine and the quality feels fresh.",
            "Used this {$category} item at home for a few weeks. {$productName} was neatly packed and easy to use.",
            "The aroma and texture of {$productName} were what I expected from a good {$category} product.",
            "Bought {$productName} for our family’s {$category} needs. It arrived fresh and the instructions were clear.",
        ][($product->id + $slot) % 4];

        return match (true) {
            $rating === 5 => "{$usage} Mashallah, it has become a repeat purchase for us.",
            $rating === 4 => "{$usage} Very satisfied overall; I would order it again.",
            $rating === 3 => "{$usage} It was decent, though I would have preferred slightly better packaging.",
            $rating === 2 => "{$usage} The product was usable, but delivery took longer than expected.",
            default => "I ordered {$productName} for {$category} use, but this batch did not suit my expectations. Hoping the next one is fresher.",
        };
    }
}
