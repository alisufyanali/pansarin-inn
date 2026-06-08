<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductsSeeder extends Seeder
{
    public function run()
    {
        // ═══════════════════════════════════════════
        // 1. HERBAL PRODUCT with Weight + Form variants
        // ═══════════════════════════════════════════
        $herbalCategory = Category::where('slug', 'herb')->first();
        
        if ($herbalCategory) {
            $product = Product::create([
                'name' => 'Turmeric (Haldi)',
                'urdu_name' => 'ہلدی',
                'scientific_name' => 'Curcuma longa',
                'slug' => 'turmeric-haldi',
                'sku' => 'HERB-001',
                'category_id' => $herbalCategory->id,
                'short_description' => 'Premium quality turmeric with natural healing properties',
                'long_description' => 'Our organic turmeric is sourced from the finest farms. Known for its anti-inflammatory and antioxidant properties, it is perfect for cooking and medicinal use.',
                'status' => true,
                'featured' => true,
                'thumbnail' => 'products/turmeric.jpg',
                'tags' => ['organic', 'herbal', 'anti-inflammatory'],
                'meta_title' => 'Buy Premium Turmeric (Haldi) Online',
                'meta_description' => 'High-quality organic turmeric available in whole and powder form',
            ]);

            // Get Weight and Form attributes
            $weightAttr = Attribute::where('category_id', $herbalCategory->id)->where('slug', 'weight')->first();
            $formAttr = Attribute::where('category_id', $herbalCategory->id)->where('slug', 'form')->first();

            if ($weightAttr && $formAttr) {
                $weights = $weightAttr->values; // 50gm, 100gm, 250gm, 500gm
                $forms = $formAttr->values;     // Whole, Powder

                $variantIndex = 1;
                foreach ($weights as $weight) {
                    foreach ($forms as $form) {
                        // Calculate price based on weight
                        $basePrice = match($weight->value) {
                            '50 gm' => 80,
                            '100 gm' => 150,
                            '250 gm' => 350,
                            '500 gm' => 650,
                            default => 100,
                        };

                        // Powder is slightly more expensive
                        if ($form->value === 'Powder') {
                            $basePrice += 100;
                        }

                        ProductVariant::create([
                            'product_id' => $product->id,
                            'sku' => 'HERB-001-V' . str_pad($variantIndex, 2, '0', STR_PAD_LEFT),
                            'attribute_value_id' => $weight->id, // Primary attribute
                            'value' => $weight->value . ' - ' . $form->value,
                            'attributes' => [
                                'Weight' => $weight->value,
                                'Form' => $form->value,
                            ],
                            'price' => $basePrice,
                            'sale_price' => null,
                            'stock_alert' => 10,
                            'is_default' => ($variantIndex === 1),
                            'status' => true,
                        ]);

                        $variantIndex++;
                    }
                }
            }

            $this->command->info('✅ Herbal product (Turmeric) with variants created!');
        }

        // ═══════════════════════════════════════════
        // 2. OILS PRODUCT with Pack variants
        // ═══════════════════════════════════════════
        $oilsCategory = Category::where('slug', 'oils')->first();
        
        if ($oilsCategory) {
            $product = Product::create([
                'name' => 'Coconut Oil (Nariyal Ka Tel)',
                'urdu_name' => 'ناریل کا تیل',
                'slug' => 'coconut-oil',
                'sku' => 'OIL-001',
                'category_id' => $oilsCategory->id,
                'short_description' => 'Pure cold-pressed coconut oil for cooking and hair care',
                'long_description' => 'Our virgin coconut oil is extracted using traditional cold-press methods, preserving all natural nutrients. Perfect for cooking, skin care, and hair treatment.',
                'status' => true,
                'featured' => true,
                'thumbnail' => 'products/coconut-oil.jpg',
                'tags' => ['oil', 'natural', 'cold-pressed'],
                'meta_title' => 'Buy Pure Coconut Oil Online',
                'meta_description' => 'Premium quality cold-pressed coconut oil available in multiple sizes',
            ]);

            $packAttr = Attribute::where('category_id', $oilsCategory->id)->where('slug', 'pack')->first();

            if ($packAttr) {
                $packs = $packAttr->values; // 30ml, 60ml, 100ml, 120ml, 200ml, 500ml, 1L

                $variantIndex = 1;
                foreach ($packs as $pack) {
                    $basePrice = match($pack->value) {
                        '30 ml' => 120,
                        '60 ml' => 220,
                        '100 ml' => 350,
                        '120 ml' => 400,
                        '200 ml' => 650,
                        '500 ml' => 1500,
                        '1 L' => 2800,
                        default => 200,
                    };

                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => 'OIL-001-V' . str_pad($variantIndex, 2, '0', STR_PAD_LEFT),
                        'attribute_value_id' => $pack->id,
                        'value' => $pack->value,
                        'attributes' => [
                            'Pack' => $pack->value,
                        ],
                        'price' => $basePrice,
                        'sale_price' => null,
                        'stock_alert' => 5,
                        'is_default' => ($variantIndex === 1),
                        'status' => true,
                    ]);

                    $variantIndex++;
                }
            }

            $this->command->info('✅ Oils product (Coconut Oil) with variants created!');
        }

        // ═══════════════════════════════════════════
        // 3. SUPPLEMENTS PRODUCT with Weight variants
        // ═══════════════════════════════════════════
        $supplementsCategory = Category::where('slug', 'supplements')->first();
        
        if ($supplementsCategory) {
            $product = Product::create([
                'name' => 'Moringa Powder',
                'urdu_name' => 'مورنگا پاؤڈر',
                'scientific_name' => 'Moringa oleifera',
                'slug' => 'moringa-powder',
                'sku' => 'SUPP-001',
                'category_id' => $supplementsCategory->id,
                'short_description' => 'Nutrient-rich moringa powder supplement',
                'long_description' => 'Moringa powder is packed with vitamins, minerals, and antioxidants. A natural superfood that supports immunity, energy, and overall wellness.',
                'status' => true,
                'featured' => false,
                'thumbnail' => 'products/moringa.jpg',
                'tags' => ['supplement', 'superfood', 'organic'],
                'meta_title' => 'Buy Moringa Powder Supplement',
                'meta_description' => 'Premium moringa powder rich in nutrients',
            ]);

            $weightAttr = Attribute::where('category_id', $supplementsCategory->id)->where('slug', 'weight')->first();

            if ($weightAttr) {
                $weights = $weightAttr->values; // 50gm, 100gm, 200gm, 500gm

                $variantIndex = 1;
                foreach ($weights as $weight) {
                    $basePrice = match($weight->value) {
                        '50 gm' => 250,
                        '100 gm' => 450,
                        '200 gm' => 850,
                        '500 gm' => 2000,
                        default => 300,
                    };

                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => 'SUPP-001-V' . str_pad($variantIndex, 2, '0', STR_PAD_LEFT),
                        'attribute_value_id' => $weight->id,
                        'value' => $weight->value,
                        'attributes' => [
                            'Weight' => $weight->value,
                        ],
                        'price' => $basePrice,
                        'sale_price' => null,
                        'stock_alert' => 8,
                        'is_default' => ($variantIndex === 1),
                        'status' => true,
                    ]);

                    $variantIndex++;
                }
            }

            $this->command->info('✅ Supplements product (Moringa Powder) with variants created!');
        }

        // ═══════════════════════════════════════════
        // 4. BEAUTY CORNER PRODUCT with Weight variants
        // ═══════════════════════════════════════════
        $beautyCategory = Category::where('slug', 'beauty-corner')->first();
        
        if ($beautyCategory) {
            $product = Product::create([
                'name' => 'Multani Mitti (Fuller\'s Earth)',
                'urdu_name' => 'ملتانی مٹی',
                'slug' => 'multani-mitti',
                'sku' => 'BEAUTY-001',
                'category_id' => $beautyCategory->id,
                'short_description' => 'Natural clay for skin care and face masks',
                'long_description' => 'Multani Mitti is a natural clay known for its deep cleansing and oil-absorbing properties. Perfect for face masks, skin treatments, and hair care.',
                'status' => true,
                'featured' => true,
                'thumbnail' => 'products/multani-mitti.jpg',
                'tags' => ['beauty', 'natural', 'skincare'],
                'meta_title' => 'Buy Multani Mitti Online',
                'meta_description' => 'Pure Multani Mitti for natural skin care',
            ]);

            $weightAttr = Attribute::where('category_id', $beautyCategory->id)->where('slug', 'weight')->first();

            if ($weightAttr) {
                $weights = $weightAttr->values;

                $variantIndex = 1;
                foreach ($weights as $weight) {
                    $basePrice = match($weight->value) {
                        '50 gm' => 60,
                        '100 gm' => 110,
                        '200 gm' => 200,
                        '500 gm' => 450,
                        default => 100,
                    };

                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => 'BEAUTY-001-V' . str_pad($variantIndex, 2, '0', STR_PAD_LEFT),
                        'attribute_value_id' => $weight->id,
                        'value' => $weight->value,
                        'attributes' => [
                            'Weight' => $weight->value,
                        ],
                        'price' => $basePrice,
                        'sale_price' => null,
                        'stock_alert' => 10,
                        'is_default' => ($variantIndex === 1),
                        'status' => true,
                    ]);

                    $variantIndex++;
                }
            }

            $this->command->info('✅ Beauty Corner product (Multani Mitti) with variants created!');
        }

        // ═══════════════════════════════════════════
        // 5. DAWAKHANA PRODUCT with Piece variants
        // ═══════════════════════════════════════════
        $dawakhanaCategory = Category::where('slug', 'dawakhana')->first();
        
        if ($dawakhanaCategory) {
            $product = Product::create([
                'name' => 'Hamdard Rooh Afza',
                'urdu_name' => 'ہمدرد روح افزا',
                'slug' => 'hamdard-rooh-afza',
                'sku' => 'DAWA-001',
                'category_id' => $dawakhanaCategory->id,
                'short_description' => 'Traditional herbal drink concentrate',
                'long_description' => 'Hamdard Rooh Afza is a popular herbal drink made from natural ingredients. Perfect for hot summer days, it provides instant refreshment and cooling effect.',
                
                'status' => true,
                'featured' => false,
                'thumbnail' => 'products/rooh-afza.jpg',
                'tags' => ['dawakhana', 'herbal', 'drink'],
                'meta_title' => 'Buy Hamdard Rooh Afza Online',
                'meta_description' => 'Authentic Hamdard Rooh Afza herbal drink',
            ]);

            $pieceAttr = Attribute::where('category_id', $dawakhanaCategory->id)->where('slug', 'piece')->first();

            if ($pieceAttr) {
                $pieces = $pieceAttr->values; // 1, 2, 3, 5, 10

                $variantIndex = 1;
                foreach ($pieces as $piece) {
                    $basePrice = match($piece->value) {
                        '1' => 450,
                        '2' => 850,
                        '3' => 1200,
                        '5' => 1950,
                        '10' => 3800,
                        default => 450,
                    };

                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => 'DAWA-001-V' . str_pad($variantIndex, 2, '0', STR_PAD_LEFT),
                        'attribute_value_id' => $piece->id,
                        'value' => $piece->value . ' Piece' . ($piece->value > 1 ? 's' : ''),
                        'attributes' => [
                            'Piece' => $piece->value,
                        ],
                        'price' => $basePrice,
                        'sale_price' => null,
                        'stock_alert' => 5,
                        'is_default' => ($variantIndex === 1),
                        'status' => true,
                    ]);

                    $variantIndex++;
                }
            }

            $this->command->info('✅ Dawakhana product (Rooh Afza) with piece variants created!');
        }

        $this->command->info('🎉 All products with variants seeded successfully!');
    }
}
