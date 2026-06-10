<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            // Sindh
            ['name' => 'Karachi',       'shipping_charges' => 300, 'province' => 'sindh'],
            ['name' => 'Hyderabad',     'shipping_charges' => 280, 'province' => 'sindh'],
            ['name' => 'Sukkur',        'shipping_charges' => 270, 'province' => 'sindh'],
            ['name' => 'Larkana',       'shipping_charges' => 270, 'province' => 'sindh'],
            ['name' => 'Nawabshah',     'shipping_charges' => 270, 'province' => 'sindh'],

            // Punjab
            ['name' => 'Lahore',        'shipping_charges' => 250, 'province' => 'punjab'],
            ['name' => 'Faisalabad',    'shipping_charges' => 240, 'province' => 'punjab'],
            ['name' => 'Rawalpindi',    'shipping_charges' => 210, 'province' => 'punjab'],
            ['name' => 'Multan',        'shipping_charges' => 240, 'province' => 'punjab'],
            ['name' => 'Gujranwala',    'shipping_charges' => 240, 'province' => 'punjab'],
            ['name' => 'Sialkot',       'shipping_charges' => 240, 'province' => 'punjab'],
            ['name' => 'Bahawalpur',    'shipping_charges' => 250, 'province' => 'punjab'],
            ['name' => 'Sargodha',      'shipping_charges' => 240, 'province' => 'punjab'],

            // KPK
            ['name' => 'Peshawar',      'shipping_charges' => 220, 'province' => 'kpk'],
            ['name' => 'Mardan',        'shipping_charges' => 230, 'province' => 'kpk'],
            ['name' => 'Abbottabad',    'shipping_charges' => 230, 'province' => 'kpk'],
            ['name' => 'Swat',          'shipping_charges' => 240, 'province' => 'kpk'],

            // Balochistan
            ['name' => 'Quetta',        'shipping_charges' => 350, 'province' => 'balochistan'],
            ['name' => 'Gwadar',        'shipping_charges' => 400, 'province' => 'balochistan'],
            ['name' => 'Turbat',        'shipping_charges' => 380, 'province' => 'balochistan'],

            // Islamabad (Capital)
            ['name' => 'Islamabad',     'shipping_charges' => 200, 'province' => 'punjab'],

            // Gilgit-Baltistan
            ['name' => 'Gilgit',        'shipping_charges' => 450, 'province' => 'gilgit'],
            ['name' => 'Skardu',        'shipping_charges' => 460, 'province' => 'gilgit'],

            // Azad Kashmir
            ['name' => 'Muzaffarabad',  'shipping_charges' => 300, 'province' => 'azad_kashmir'],
            ['name' => 'Mirpur',        'shipping_charges' => 290, 'province' => 'azad_kashmir'],
        ];

        DB::table('cities')->insert($cities);
    }
}
