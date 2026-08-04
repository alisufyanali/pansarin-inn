<?php

namespace Database\Seeders;

use App\Models\HealthConcern;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class HealthConcernSeeder extends Seeder
{
    public function run(): void
    {
        $concerns = [
            [
                'slug' => 'hair',
                'name' => 'Hair Care',
                'icon' => 'leaf', // FaLeaf
            ],
            [
                'slug' => 'skin',
                'name' => 'Skin Care',
                'icon' => 'smile', // FaSmile
            ],
            [
                'slug' => 'sleep',
                'name' => 'Better Sleep',
                'icon' => 'moon', // FaMoon
            ],
            [
                'slug' => 'energy',
                'name' => 'Energy & Vitality',
                'icon' => 'bolt', // FaBolt
            ],
            [
                'slug' => 'immunity',
                'name' => 'Immunity Boost',
                'icon' => 'shield-alt', // FaShieldAlt
            ],
            [
                'slug' => 'digestion',
                'name' => 'Digestion',
                'icon' => 'heart', // FaHeart
            ],
            [
                'slug' => 'stress',
                'name' => 'Stress Relief',
                'icon' => 'brain', // FaBrain
            ],
            [
                'slug' => 'joints',
                'name' => 'Joint & Muscle Pain',
                'icon' => 'wind', // FaWind
            ],
            [
                'slug' => 'hydration',
                'name' => 'Hydration & Detox',
                'icon' => 'wind', // FaWind (duplicate, but okay)
            ],
            [
                'slug' => 'weight',
                'name' => 'Weight Management',
                'icon' => 'fire', // FaFire
            ],
            [
                'slug' => 'eye',
                'name' => 'Eye Care',
                'icon' => 'eye', // FaEye
            ],
            [
                'slug' => 'respiratory',
                'name' => 'Respiratory Health',
                'icon' => 'wind', // FaWind
            ],
        ];

        foreach ($concerns as $index => $concern) {
            HealthConcern::firstOrCreate(
                ['slug' => $concern['slug']],
                [
                    'name'       => $concern['name'],
                    'icon'       => $concern['icon'],
                    'status'     => true,
                    'sort_order' => $index + 1,
                ]
            );
        }

        $this->command->info('✅ Health concerns seeded successfully! (' . count($concerns) . ' records)');
    }
}