<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Herbal Remedies',    'slug' => 'herbal-remedies'],
            ['name' => 'Health Tips',        'slug' => 'health-tips'],
            ['name' => 'Nutrition',          'slug' => 'nutrition'],
            ['name' => 'Natural Skincare',   'slug' => 'natural-skincare'],
            ['name' => 'Ayurvedic Medicine', 'slug' => 'ayurvedic-medicine'],
            ['name' => 'Digestive Health',   'slug' => 'digestive-health'],
            ['name' => 'Immunity Boosters',  'slug' => 'immunity-boosters'],
            ['name' => 'Weight Management',  'slug' => 'weight-management'],
        ];

        foreach ($categories as $cat) {
            BlogCategory::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        $this->command->info('Blog categories seeded successfully!');
    }
}
