<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Herb',
                'slug' => 'herb',
                'image' => 'categories/herb.png',
                'status' => true,
            ],
            [
                'name' => "Oils",
                'slug' => 'oils',
                'image' => 'categories/oils.png',
                'status' => true,
            ],
            [
                'name' => "Supplements",
                'slug' => 'supplements',
                'image' => 'categories/supplements.png',
                'status' => true,
            ],
            [
                'name' => 'Beauty Corner',
                'slug' => 'beauty-corner',
                'image' => 'categories/beauty-corner.png',
                'status' => true,
            ],
            [
                'name' => 'Dawakhana',
                'slug' => 'dawakhana',
                'status' => true,
            ],
             [
                'name' => 'Remedies',
                'slug' => 'remedies',
                'image' => 'categories/remedies.png',
                'status' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']], // Slug se check karega taake duplicate na ho
                [
                    'name'   => $category['name'],
                    'status' => $category['status'],
                    'image'  => $category['image'],
                ]
            );
        }

        $this->command->info('Categories seeded successfully!');
    }
}
