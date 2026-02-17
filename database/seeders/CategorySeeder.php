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
                'status' => true
            ],
            [
                'name' => "Men's Fashion", 
                'slug' => 'mens-fashion', 
                'status' => true
            ],
            [
                'name' => "Women's Fashion", 
                'slug' => 'womens-fashion', 
                'status' => true
            ],
            [
                'name' => 'Kids & Baby', 
                'slug' => 'kids-baby', 
                'status' => true
            ],
            [
                'name' => 'Beauty & Personal Care', 
                'slug' => 'beauty-personal-care', 
                'status' => true
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']], // Slug se check karega taake duplicate na ho
                [
                    'name' => $category['name'], 
                    'status' => $category['status']
                ]
            );
        }

        $this->command->info('Categories seeded successfully!');
    }
}