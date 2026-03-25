<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Country
        $countryId = DB::table('countries')->insertGetId([
            'name' => 'Pakistan',
            'code' => 'PK',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Create States
        $sindhId = DB::table('states')->insertGetId([
            'country_id' => $countryId,
            'name' => 'Sindh',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $punjabId = DB::table('states')->insertGetId([
            'country_id' => $countryId,
            'name' => 'Punjab',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $kpkId = DB::table('states')->insertGetId([
            'country_id' => $countryId,
            'name' => 'Khyber Pakhtunkhwa',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $federalId = DB::table('states')->insertGetId([
            'country_id' => $countryId,
            'name' => 'Federal Capital',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Create Cities linked to States
        DB::table('cities')->insert([
            // Sindh Cities
            [
                'state_id' => $sindhId,
                'name' => 'Karachi',
                'shipping_charges' => 300,
                'created_at' => now(),
            ],
            [
                'state_id' => $sindhId,
                'name' => 'Hyderabad',
                'shipping_charges' => 250,
                'created_at' => now(),
            ],
            // Punjab Cities
            [
                'state_id' => $punjabId,
                'name' => 'Lahore',
                'shipping_charges' => 250,
                'created_at' => now(),
            ],
            [
                'state_id' => $punjabId,
                'name' => 'Faisalabad',
                'shipping_charges' => 220,
                'created_at' => now(),
            ],
            // Federal
            [
                'state_id' => $federalId,
                'name' => 'Islamabad',
                'shipping_charges' => 200,
                'created_at' => now(),
            ],
            // KPK
            [
                'state_id' => $kpkId,
                'name' => 'Peshawar',
                'shipping_charges' => 220,
                'created_at' => now(),
            ],
        ]);
    }
}