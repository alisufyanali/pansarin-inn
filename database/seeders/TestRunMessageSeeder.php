<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class TestRunMessageSeeder extends Seeder
{
    public function run(): void
    {
        // Ye sirf log mein message print karega aur success confirm karega
        Log::info('Test Seeder: "test-run-message" successfully executed!');
    }
}