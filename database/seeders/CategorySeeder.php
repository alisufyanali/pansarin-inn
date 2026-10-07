<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

/**
 * The 14 storefront categories, in the owner's display order (Admin →
 * Categories can change it later). Each has its own storefront page
 * (/herb, /honey, …). Images live in storage/app/public/categories; the
 * ones without a file get one uploaded from the admin.
 *
 * Only fills what is missing: a name, order or image the admin has set is
 * never overwritten, so this is safe to re-run.
 */
class CategorySeeder extends Seeder
{
    private const CATEGORIES = [
        // slug            name             image
        ['herb',          'Herbs',         'categories/herb.png'],
        ['seeds',         'Seeds',         'categories/seeds.png'],
        ['spices',        'Spices',        'categories/spiecs.png'],
        ['dry-fruits',    'Dry Fruits',    'categories/dry-fruits.png'],
        ['oils',          'Oils',          'categories/oils.png'],
        ['supplements',   'Supplements',   'categories/supplements.png'],
        ['herbal-tea',    'Herbal Tea',    'categories/herbal-tea.png'],
        ['remedies',      'Remedies',      'categories/remedies.png'],
        ['dawakhana',     'Dawakhana',     'categories/dawakhana.png'],
        ['combo-deals',   'Combo Deals',   null],
        ['honey',         'Honey',         null],
        ['murrabajat',    'Murrabajat',    null],
        ['arqiyaat',      'Arqiyaat',      null],
        ['beauty-corner', 'Beauty Corner', 'categories/beauty-corner.png'],
    ];

    public function run()
    {
        foreach (self::CATEGORIES as $i => [$slug, $name, $image]) {
            $category = Category::firstOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'status' => true, 'image' => $image, 'sort_order' => $i + 1]
            );

            // Existing row (e.g. made by a migration): fill only the gaps
            $category->image ??= $image;
            if ((int) $category->sort_order === 99) {
                $category->sort_order = $i + 1;
            }
            $category->save();
        }

        $this->command->info('Categories seeded successfully!');
    }
}
