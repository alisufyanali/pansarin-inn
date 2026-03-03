<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductsSeeder extends Seeder
{
    public function run()
    {
        // Data fetch karein
        $categories = Category::pluck('id');

        if ($categories->isEmpty()) {
            $this->command->error('Missing Categories. Please seed them first!');
            return;
        }

        // Pansari/Organic Products ki generic list
        $items = [
            ['en' => 'Pure Organic Honey', 'ur' => 'خالص قدرتی شہد', 'unit' => 'KG'],
            ['en' => 'Almond Oil', 'ur' => 'بادام کا تیل', 'unit' => 'Litre'],
            ['en' => 'Black Seed Oil', 'ur' => 'کلونجی کا تیل', 'unit' => 'Bottle'],
            ['en' => 'Amla Powder', 'ur' => 'آملہ پاؤڈر', 'unit' => 'Gram'],
            ['en' => 'Reetha Powder', 'ur' => 'ریٹھا پاؤڈر', 'unit' => 'Gram'],
            ['en' => 'Shikakai Powder', 'ur' => 'سیکاکائی پاؤڈر', 'unit' => 'Gram'],
            ['en' => 'Moringa Powder', 'ur' => 'مورنگا پاؤڈر', 'unit' => 'Gram'],
            ['en' => 'Aloe Vera Gel', 'ur' => 'ایلو ویرا جیل', 'unit' => 'KG'],
            ['en' => 'Saffron Pure', 'ur' => 'خالص زعفران', 'unit' => 'Gram'],
            ['en' => 'Ajwa Dates', 'ur' => 'عجوہ کھجور', 'unit' => 'KG'],
            ['en' => 'Pink Himalayan Salt', 'ur' => 'ہمالیائی نمک', 'unit' => 'KG'],
            ['en' => 'Chia Seeds', 'ur' => 'تخم ملنگا', 'unit' => 'Gram'],
            ['en' => 'Flax Seeds', 'ur' => 'السی کے بیج', 'unit' => 'Gram'],
            ['en' => 'Rose Water', 'ur' => 'عرق گلاب', 'unit' => 'Litre'],
            ['en' => 'Turmeric Powder', 'ur' => 'ہلدی پاؤڈر', 'unit' => 'Gram'],
            ['en' => 'Neem Oil', 'ur' => 'نیم کا تیل', 'unit' => 'Bottle'],
        ];

        // 100 products loop
        foreach (range(1, 100) as $index) {
            $item = $items[array_rand($items)];
            
            // Name ko unique banane ke liye index add kiya gaya hai
            $name = $item['en'] . ' ' . $index;
            $price = rand(150, 5000);
            $salePrice = (rand(1, 10) > 7) ? $price * 0.85 : null;

            Product::create([
                'name' => $name,
                'urdu_name' => $item['ur'],
                'slug' => Str::slug($name).'-'.Str::random(5),
                'sku' => 'PNS-'.str_pad($index, 4, '0', STR_PAD_LEFT),
                'long_description' => 'Ye ek premium quality organic product hai jo ke pure aur natural tariqe se tayyar kiya gaya hai.',
                'short_description' => '100% pure organic quality.',
                'price' => $price,
                'sale_price' => $salePrice,
                'category_id' => $categories->random(),
                'status' => true,
                'featured' => (rand(1, 10) > 8),
                'unit' => $item['unit'],
                'thumbnail' => 'products/default.png',
            ]);
        }

        $this->command->info('100 Generic Products seeded with local default image!');
    }
}