<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Herbals', 
                'slug' => 'herbals', 
                'description' => 'Natural and organic herbal products for health and wellness.'
            ],
            [
                'name' => "Men's Fashion", 
                'slug' => 'mens-fashion', 
                'description' => 'Latest clothing, footwear, and styles for men.'
            ],
            [
                'name' => "Women's Fashion", 
                'slug' => 'womens-fashion', 
                'description' => 'Trendy outfits, jewelry, and accessories for women.'
            ],
            [
                'name' => 'Kids & Baby', 
                'slug' => 'kids-baby', 
                'description' => 'Comfortable clothing and toys for children and infants.'
            ],
            [
                'name' => 'Beauty & Personal Care', 
                'slug' => 'beauty-personal-care', 
                'description' => 'Skincare, makeup, and personal grooming essentials.'
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']], // Slug se check karega taake duplicate na ho
                [
                    'name' => $category['name'], 
                    'description' => $category['description']
                ]
            );
        }

        $this->command->info('Herbals, Mens, and Womens categories seeded successfully!');
    }
}