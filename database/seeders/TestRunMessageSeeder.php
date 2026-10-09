<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class TestRunMessageSeeder extends Seeder
{
    public function run(): void
    {
        // Only logs a message and confirms success
        Log::info('Test Seeder: "test-run-message" successfully executed!');
    }
}