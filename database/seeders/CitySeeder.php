<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        // Get state IDs with error checking
        $sindhId = DB::table('states')->where('name', 'Sindh')->value('id');
        $punjabId = DB::table('states')->where('name', 'Punjab')->value('id');
        $kpkId = DB::table('states')->where('name', 'Khyber Pakhtunkhwa')->value('id');
        $balochistanId = DB::table('states')->where('name', 'Balochistan')->value('id');
        $gilgitId = DB::table('states')->where('name', 'Gilgit-Baltistan')->value('id');
        $kashmirId = DB::table('states')->where('name', 'Azad Jammu and Kashmir')->value('id');

        // Validate all states exist
        if (!$sindhId || !$punjabId || !$kpkId || !$balochistanId || !$gilgitId || !$kashmirId) {
            throw new \Exception('One or more states not found. Ensure StateSeeder runs before CitySeeder.');
        }

        $cities = [
            // Sindh
            ['state_id' => $sindhId, 'name' => 'Karachi',       'shipping_charges' => 300, 'province' => 'sindh'],
            ['state_id' => $sindhId, 'name' => 'Hyderabad',     'shipping_charges' => 280, 'province' => 'sindh'],
            ['state_id' => $sindhId, 'name' => 'Sukkur',        'shipping_charges' => 270, 'province' => 'sindh'],
            ['state_id' => $sindhId, 'name' => 'Larkana',       'shipping_charges' => 270, 'province' => 'sindh'],
            ['state_id' => $sindhId, 'name' => 'Nawabshah',     'shipping_charges' => 270, 'province' => 'sindh'],

            // Punjab
            ['state_id' => $punjabId, 'name' => 'Lahore',        'shipping_charges' => 250, 'province' => 'punjab'],
            ['state_id' => $punjabId, 'name' => 'Faisalabad',    'shipping_charges' => 240, 'province' => 'punjab'],
            ['state_id' => $punjabId, 'name' => 'Rawalpindi',    'shipping_charges' => 210, 'province' => 'punjab'],
            ['state_id' => $punjabId, 'name' => 'Multan',        'shipping_charges' => 240, 'province' => 'punjab'],
            ['state_id' => $punjabId, 'name' => 'Gujranwala',    'shipping_charges' => 240, 'province' => 'punjab'],
            ['state_id' => $punjabId, 'name' => 'Sialkot',       'shipping_charges' => 240, 'province' => 'punjab'],
            ['state_id' => $punjabId, 'name' => 'Bahawalpur',    'shipping_charges' => 250, 'province' => 'punjab'],
            ['state_id' => $punjabId, 'name' => 'Sargodha',      'shipping_charges' => 240, 'province' => 'punjab'],
            ['state_id' => $punjabId, 'name' => 'Islamabad',     'shipping_charges' => 200, 'province' => 'punjab'],

            // KPK
            ['state_id' => $kpkId, 'name' => 'Peshawar',      'shipping_charges' => 220, 'province' => 'kpk'],
            ['state_id' => $kpkId, 'name' => 'Mardan',        'shipping_charges' => 230, 'province' => 'kpk'],
            ['state_id' => $kpkId, 'name' => 'Abbottabad',    'shipping_charges' => 230, 'province' => 'kpk'],
            ['state_id' => $kpkId, 'name' => 'Swat',          'shipping_charges' => 240, 'province' => 'kpk'],

            // Balochistan
            ['state_id' => $balochistanId, 'name' => 'Quetta',        'shipping_charges' => 350, 'province' => 'balochistan'],
            ['state_id' => $balochistanId, 'name' => 'Gwadar',        'shipping_charges' => 400, 'province' => 'balochistan'],
            ['state_id' => $balochistanId, 'name' => 'Turbat',        'shipping_charges' => 380, 'province' => 'balochistan'],

            // Gilgit-Baltistan
            ['state_id' => $gilgitId, 'name' => 'Gilgit',        'shipping_charges' => 450, 'province' => 'gilgit'],
            ['state_id' => $gilgitId, 'name' => 'Skardu',        'shipping_charges' => 460, 'province' => 'gilgit'],

            // Azad Kashmir
            ['state_id' => $kashmirId, 'name' => 'Muzaffarabad',  'shipping_charges' => 300, 'province' => 'azad_kashmir'],
            ['state_id' => $kashmirId, 'name' => 'Mirpur',        'shipping_charges' => 290, 'province' => 'azad_kashmir'],
        ];

        foreach ($cities as &$city) {
            $city['created_at'] = now();
            $city['updated_at'] = now();
        }

        DB::table('cities')->insert($cities);
    }
}
