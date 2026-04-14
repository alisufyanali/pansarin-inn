<?php

namespace Database\Seeders;

use App\Models\Newsletter;
use Illuminate\Database\Seeder;

class NewsletterSeeder extends Seeder
{
    public function run(): void
    {
        $subscribers = [
            ['email' => 'ali.hassan@gmail.com',    'is_verified' => true,  'is_active' => true],
            ['email' => 'sara.ahmed@yahoo.com',     'is_verified' => true,  'is_active' => true],
            ['email' => 'usman.khan@hotmail.com',   'is_verified' => true,  'is_active' => true],
            ['email' => 'fatima.malik@gmail.com',   'is_verified' => true,  'is_active' => true],
            ['email' => 'bilal.raza@gmail.com',     'is_verified' => false, 'is_active' => false],
            ['email' => 'ayesha.s@gmail.com',       'is_verified' => true,  'is_active' => true],
            ['email' => 'hamza.tariq@yahoo.com',    'is_verified' => true,  'is_active' => true],
            ['email' => 'zainab.noor@gmail.com',    'is_verified' => false, 'is_active' => false],
            ['email' => 'kamran.sheikh@gmail.com',  'is_verified' => true,  'is_active' => true],
            ['email' => 'nadia.iqbal@hotmail.com',  'is_verified' => true,  'is_active' => true],
        ];

        foreach ($subscribers as $sub) {
            Newsletter::firstOrCreate(['email' => $sub['email']], $sub);
        }

        $this->command->info('Newsletter subscribers seeded successfully!');
    }
}
