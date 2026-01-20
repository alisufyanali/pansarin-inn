<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('cities')->insert([
            [
                'name' => 'Karachi',
                'shipping_charges' => 300,
            ],
            [
                'name' => 'Lahore',
                'shipping_charges' => 250,
            ],
            [
                'name' => 'Islamabad',
                'shipping_charges' => 200,
            ],
            [
                'name' => 'Peshawar',
                'shipping_charges' => 220,
            ],
        ]);
    }
}
