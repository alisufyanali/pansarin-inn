<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attribute;
use App\Models\AttributeValue;

class AttributeSeeder extends Seeder
{
    public function run()
    {
        // Size/Volume Attribute
        $sizeAttribute = Attribute::firstOrCreate(
            ['slug' => 'size'],
            ['name' => 'Size/Volume']
        );

        // Size values (ml/weights)
        $sizes = [
            ['value' => '100ml', 'slug' => '100ml'],
            ['value' => '120ml', 'slug' => '120ml'],
            ['value' => '150ml', 'slug' => '150ml'],
            ['value' => '200ml', 'slug' => '200ml'],
            ['value' => '250ml', 'slug' => '250ml'],
            ['value' => '500ml', 'slug' => '500ml'],
            ['value' => '1L', 'slug' => '1l'],
        ];

        foreach ($sizes as $size) {
            AttributeValue::firstOrCreate(
                ['attribute_id' => $sizeAttribute->id, 'value' => $size['value']],
                ['slug' => $size['slug']]
            );
        }

        // Color Attribute
        $colorAttribute = Attribute::firstOrCreate(
            ['slug' => 'color'],
            ['name' => 'Color']
        );

        $colors = [
            ['value' => 'Red', 'slug' => 'red'],
            ['value' => 'Blue', 'slug' => 'blue'],
            ['value' => 'Green', 'slug' => 'green'],
            ['value' => 'Black', 'slug' => 'black'],
            ['value' => 'White', 'slug' => 'white'],
        ];

        foreach ($colors as $color) {
            AttributeValue::firstOrCreate(
                ['attribute_id' => $colorAttribute->id, 'value' => $color['value']],
                ['slug' => $color['slug']]
            );
        }

        $this->command->info('✅ Attributes and values created successfully!');
    }
}
