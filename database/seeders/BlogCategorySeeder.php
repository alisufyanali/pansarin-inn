<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Herbal Remedies',
            'Health Tips',
            'Nutrition',
            'Natural Skincare',
            'Ayurvedic Medicine',
            'Digestive Health',
            'Immunity Boosters',
            'Weight Management',
        ];

        foreach ($categories as $name) {
            BlogCategory::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'slug' => Str::slug($name), 'status' => true]
            );
        }

        $this->command->info('Blog categories seeded successfully!');
    }
}
