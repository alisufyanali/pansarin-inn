<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StateSeeder extends Seeder
{
    public function run(): void
    {
        $pakistanId = DB::table('countries')->where('name', 'Pakistan')->value('id');

        $states = [
            ['country_id' => $pakistanId, 'name' => 'Sindh'],
            ['country_id' => $pakistanId, 'name' => 'Punjab'],
            ['country_id' => $pakistanId, 'name' => 'Khyber Pakhtunkhwa'],
            ['country_id' => $pakistanId, 'name' => 'Balochistan'],
            ['country_id' => $pakistanId, 'name' => 'Gilgit-Baltistan'],
            ['country_id' => $pakistanId, 'name' => 'Azad Jammu and Kashmir'],
        ];

        foreach ($states as &$state) {
            $state['created_at'] = now();
            $state['updated_at'] = now();
        }

        DB::table('states')->insert($states);
    }
}
