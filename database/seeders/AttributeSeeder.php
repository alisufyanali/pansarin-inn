<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;

class AttributeSeeder extends Seeder
{
    public function run()
    {
        //  Volume Attribute
        $sizeAttribute = Attribute::firstOrCreate(
            ['slug' => 'volume'],
            ['name' => 'Volume']
        );

        //  Volume values (ml/weights)
        $sizes = [
            ['value' => '100', 'slug' => 'ml'],
            ['value' => '120', 'slug' => 'ml'],
            ['value' => '150', 'slug' => 'ml'],
            ['value' => '200', 'slug' => 'ml'],
            ['value' => '250', 'slug' => 'ml'],
            ['value' => '500', 'slug' => 'ml'],
            ['value' => '1', 'slug' => 'l'],
        ];

        foreach ($sizes as $size) {
            AttributeValue::firstOrCreate(
                ['attribute_id' => $sizeAttribute->id, 'value' => $size['value']],
                ['slug' => $size['slug']]
            );
        }

        // Unit Attribute
        $unitAttribute = Attribute::firstOrCreate(
            ['slug' => 'weights'],
            ['name' => 'Weights']
        );

        $units = [
            ['value' => '60', 'slug' => 'gm'],
            ['value' => '120', 'slug' => 'gm'],
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
