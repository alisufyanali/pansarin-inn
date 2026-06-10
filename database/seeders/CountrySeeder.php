<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('countries')->insert([
            'name' => 'Pakistan',
            'code' => 'PK',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
