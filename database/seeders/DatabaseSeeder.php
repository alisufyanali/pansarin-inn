<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run()
    {
        $this->call([
            RolePermissionSeeder::class,
            AttributeSeeder::class,
            CitySeeder::class,
            OrderSeeder::class,
            UiSettingSeeder::class,
            GeneralSettingSeeder::class,
            BusinessSettingSeeder::class,
            SaleSeeder::class,
            WhatsAppMediaSeeder::class,
            WhatsAppSeeder::class

        ]);
    }
}
