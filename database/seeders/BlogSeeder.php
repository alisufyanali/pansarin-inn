<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlogCategory::first()?->id ?? 1;

        $blogs = [
            [
                'title'   => 'Top 10 Herbal Remedies for Common Cold',
                'excerpt' => 'Discover natural herbs that can help you fight the common cold effectively.',
                'content' => '<p>Herbal remedies have been used for centuries to treat common ailments. Here are the top 10 herbs that can help you recover from a cold faster...</p>',
                'status'  => true,
            ],
            [
                'title'   => 'Benefits of Ajwain (Carom Seeds) for Digestion',
                'excerpt' => 'Ajwain is a powerful herb known for its digestive properties.',
                'content' => '<p>Ajwain or carom seeds are widely used in Pakistani cuisine and traditional medicine. They contain thymol which aids digestion and relieves bloating...</p>',
                'status'  => true,
            ],
            [
                'title'   => 'Kalonji (Black Seed) — The Miracle Herb',
                'excerpt' => 'Black seed has been called a cure for everything except death.',
                'content' => '<p>Kalonji or Nigella Sativa has been used in Islamic medicine for over 2000 years. It contains thymoquinone which has powerful anti-inflammatory properties...</p>',
                'status'  => true,
            ],
            [
                'title'   => 'How to Use Turmeric for Inflammation',
                'excerpt' => 'Turmeric contains curcumin, a natural anti-inflammatory compound.',
                'content' => '<p>Turmeric has been used in Ayurvedic medicine for thousands of years. The active compound curcumin helps reduce inflammation and oxidative stress...</p>',
                'status'  => true,
            ],
            [
                'title'   => 'Natural Skincare with Rose Water',
                'excerpt' => 'Rose water is a gentle toner that suits all skin types.',
                'content' => '<p>Rose water has been a beauty secret for centuries. It helps balance skin pH, reduce redness, and hydrate the skin naturally...</p>',
                'status'  => false,
            ],
        ];

        foreach ($blogs as $blog) {
            Blog::firstOrCreate(
                ['slug' => Str::slug($blog['title'])],
                array_merge($blog, [
                    'slug'             => Str::slug($blog['title']),
                    'blog_category_id' => $categoryId,
                    'meta_title'       => $blog['title'],
                    'meta_description' => $blog['excerpt'],
                ])
            );
        }

        $this->command->info('Blogs seeded successfully!');
    }
}
