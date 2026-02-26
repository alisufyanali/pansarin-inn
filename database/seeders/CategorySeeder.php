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
                'status' => true,
            ],
            [
                'name' => "Oils",
                'slug' => 'oils',
                'status' => true,
            ],
            [
                'name' => "Supplements",
                'slug' => 'supplements',
                'status' => true,
            ],
            [
                'name' => 'Beauty Corner',
                'slug' => 'beauty-corner',
                'status' => true,
            ],
            [
                'name' => 'Dawakhana',
                'slug' => 'dawakhana',
                'status' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']], // Slug se check karega taake duplicate na ho
                [
                    'name' => $category['name'],
                    'status' => $category['status'],
                ]
            );
        }

        $this->command->info('Categories seeded successfully!');
    }
}
