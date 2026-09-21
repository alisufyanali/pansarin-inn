<?php

namespace App\Console\Commands;

use App\Services\CustomerLegacyImportService;
use Illuminate\Console\Command;

class CustomersImportRescueCommand extends Command
{
    protected $signature = 'customers:import-rescue {file : Path to corrected rescue CSV with phone column}';

    protected $description = 'Import manually corrected rescue PK customers';

    public function handle(CustomerLegacyImportService $service): int
    {
        $path = $this->argument('file');
        if (! is_readable($path)) {
            $this->error('File not readable: ' . $path);

            return self::FAILURE;
        }

        $fp = fopen($path, 'r');
        $header = fgetcsv($fp);
        if (! $header) {
            $this->error('Empty CSV');

            return self::FAILURE;
        }
        $header = array_map(fn ($h) => strtolower(trim((string) $h)), $header);
        $imported = 0;
        $failed = 0;

        while (($data = fgetcsv($fp)) !== false) {
            $row = array_combine($header, $data);
            if ($row === false) {
                continue;
            }
            try {
                $service->importRescueRow($row);
                $imported++;
            } catch (\Throwable $e) {
                $failed++;
                $this->warn('Skip row: ' . $e->getMessage());
            }
        }
        fclose($fp);

        $this->info("imported: {$imported}, failed: {$failed}");

        return self::SUCCESS;
    }
}
