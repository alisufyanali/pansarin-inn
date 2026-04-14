<?php

namespace Database\Seeders;

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
            BusinessSettingSeeder::class,
            CategorySeeder::class,
            AttributeSeeder::class,
            CitySeeder::class,
            ContactSeeder::class,
            CustomerSeeder::class,
            GeneralSettingSeeder::class,
            ProductsSeeder::class,
            OrderSeeder::class,
            SaleSeeder::class,
            CouponSeeder::class,
            NewsletterSeeder::class,
            BlogCategorySeeder::class,
            BlogSeeder::class,
            ProductReviewSeeder::class,
            DealSeeder::class,
            AffiliateSeeder::class,
            UiSettingSeeder::class,
            WhatsAppMediaSeeder::class,
            WhatsAppSeeder::class,
        ]);
    }
}
