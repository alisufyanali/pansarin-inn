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
            AdminSeeder::class,
            BusinessSettingSeeder::class,
            CategorySeeder::class,
            AttributeSeeder::class,
            LocationSeeder::class,
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
            SlideSeeder::class,
            UiSettingSeeder::class,
            WhatsAppMediaSeeder::class,
            WhatsAppSeeder::class,
        ]);
    }
}
