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

        // Unit Attribute
        $unitAttribute = Attribute::firstOrCreate(
            ['slug' => 'unit'],
            ['name' => 'Unit']
        );

        $units = [
            ['value' => 'kg', 'slug' => 'kg'],
            ['value' => 'g', 'slug' => 'g'],
            ['value' => 'L', 'slug' => 'l'],
            ['value' => 'ml', 'slug' => 'ml'],
            ['value' => 'Piece', 'slug' => 'piece'],
            ['value' => 'Box', 'slug' => 'box'],
            ['value' => 'Bottle', 'slug' => 'bottle'],
            ['value' => 'Jar', 'slug' => 'jar'],
        ];

        foreach ($units as $unit) {
            AttributeValue::firstOrCreate(
                ['attribute_id' => $unitAttribute->id, 'value' => $unit['value']],
                ['slug' => $unit['slug']]
            );
        }

        $this->command->info('✅ Attributes and values created successfully!');
    }
}
