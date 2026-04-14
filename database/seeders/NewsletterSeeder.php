<?php

namespace Database\Seeders;

use App\Models\Newsletter;
use Illuminate\Database\Seeder;

class NewsletterSeeder extends Seeder
{
    public function run(): void
    {
        $subscribers = [
            ['email' => 'ali.hassan@gmail.com',    'name' => 'Ali Hassan',     'status' => 'active',        'verified_at' => now()],
            ['email' => 'sara.ahmed@yahoo.com',     'name' => 'Sara Ahmed',     'status' => 'active',        'verified_at' => now()],
            ['email' => 'usman.khan@hotmail.com',   'name' => 'Usman Khan',     'status' => 'active',        'verified_at' => now()],
            ['email' => 'fatima.malik@gmail.com',   'name' => 'Fatima Malik',   'status' => 'active',        'verified_at' => now()],
            ['email' => 'bilal.raza@gmail.com',     'name' => 'Bilal Raza',     'status' => 'unsubscribed',  'verified_at' => null],
            ['email' => 'ayesha.s@gmail.com',       'name' => 'Ayesha S',       'status' => 'active',        'verified_at' => now()],
            ['email' => 'hamza.tariq@yahoo.com',    'name' => 'Hamza Tariq',    'status' => 'active',        'verified_at' => now()],
            ['email' => 'zainab.noor@gmail.com',    'name' => 'Zainab Noor',    'status' => 'unsubscribed',  'verified_at' => null],
            ['email' => 'kamran.sheikh@gmail.com',  'name' => 'Kamran Sheikh',  'status' => 'active',        'verified_at' => now()],
            ['email' => 'nadia.iqbal@hotmail.com',  'name' => 'Nadia Iqbal',    'status' => 'active',        'verified_at' => now()],
        ];

        foreach ($subscribers as $sub) {
            Newsletter::firstOrCreate(['email' => $sub['email']], $sub);
        }

        $this->command->info('Newsletter subscribers seeded successfully!');
    }
}
