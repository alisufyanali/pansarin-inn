<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\AttributeValue;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class ProductsSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Data fetch karein
        $categories = Category::pluck('id');

        // Check if dependencies exist
        if ($categories->isEmpty()) {
            $this->command->error('Missing Categories. Please seed them first!');
            return;
        }

        foreach (range(1, 50) as $index) {
            $name = $faker->unique()->words(3, true);
            $price = $faker->randomFloat(2, 100, 5000);
            
            // Randomly decide if product is on sale
            $salePrice = $faker->boolean(30) ? $price * 0.8 : null; 

            Product::create([
                'name'              => ucfirst($name),
                'slug'              => Str::slug($name) . '-' . Str::random(5),
                'sku'               => strtoupper(Str::random(3)) . '-' . rand(1000, 9999),
                'long_description'  => $faker->paragraph(3),
                'short_description' => $faker->sentence(),
                'price'             => $price,
                'sale_price'        => $salePrice,
                'category_id'       => $categories->random(),
                'stock_qty'         => rand(0, 200),
                'status'            => $faker->boolean(90), // 90% products will be active
                'featured'          => $faker->boolean(15), // 15% featured
                'thumbnail'         => 'products/default.jpg', // Placeholder image path
            ]);
        }

        $this->command->info('50 Products seeded successfully!');
    }
}