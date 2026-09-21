<?php

namespace Database\Seeders;

use App\Services\CustomerLegacyImportService;
use Illuminate\Database\Seeder;

class CustomerImportSeeder extends Seeder
{
    public function run(): void
    {
        $stats = app(CustomerLegacyImportService::class)->run(dryRun: false);

        $this->command?->info('Customer import finished.');
        $this->command?->info('imported: ' . $stats['imported']);
        $this->command?->info('skipped: ' . $stats['skipped']);
        foreach ($stats['bucket'] as $bucket => $count) {
            $this->command?->line("  bucket_{$bucket}: {$count}");
        }
        $this->command?->info('skip_csv: ' . $stats['skip_path']);
        $this->command?->info('rescue_csv: ' . $stats['rescue_path']);
    }
}
