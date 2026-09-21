<?php

namespace App\Console\Commands;

use App\Services\CustomerLegacyImportService;
use Illuminate\Console\Command;

class CustomersImportCommand extends Command
{
    protected $signature = 'customers:import {--dry-run : Report only, no DB or CSV writes}';

    protected $description = 'Import legacy customers.json with PK phone rules';

    public function handle(CustomerLegacyImportService $service): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $stats = $service->run($dryRun);

        $this->info('total_rows: ' . $stats['total']);
        $this->info('imported: ' . $stats['imported']);
        $this->info('skipped: ' . $stats['skipped']);
        foreach ($stats['reason'] as $k => $v) {
            $this->line("  reason_{$k}: {$v}");
        }
        foreach ($stats['bucket'] as $k => $v) {
            $this->line("  bucket_{$k}: {$v}");
        }
        foreach ($stats['raw_formats'] as $k => $v) {
            $this->line("  format_{$k}: {$v}");
        }
        if (! $dryRun) {
            $this->info('skip_csv: ' . $stats['skip_path']);
            $this->info('rescue_csv: ' . $stats['rescue_path']);
        }
        $this->info('rescue_pk_samples_masked:');
        foreach ($stats['rescue_samples'] as $i => $s) {
            $this->line('  ' . ($i + 1) . ' ' . $s);
        }

        return self::SUCCESS;
    }
}
