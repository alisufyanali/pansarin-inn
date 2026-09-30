<?php

namespace App\Console\Commands;

use App\Models\ProductVariant;
use Illuminate\Console\Command;

class BackfillPowderAdditional extends Command
{
    /**
     * Idempotent one-time backfill:
     * Sets additional = 100 on every ProductVariant where
     *   attributes->Form = 'Powder'  AND  additional = 0
     *
     * Safe to run multiple times — the additional = 0 guard prevents double-apply.
     */
    protected $signature   = 'backfill:powder-additional';
    protected $description = 'Set additional = 100 on Powder variants that currently have additional = 0';

    public function handle(): int
    {
        // Filter in PHP: raw json_extract() returns the quoted value ("Powder") on
        // MySQL but the bare value on SQLite, so a SQL comparison matched 0 rows
        // on MySQL. A few thousand variants — cheap to scan.
        $ids = ProductVariant::withTrashed() // include soft-deleted rows — backfill data integrity
            ->where('additional', 0)
            ->get(['id', 'attributes'])
            ->filter(fn (ProductVariant $v) => strcasecmp(trim((string) (((array) $v->getAttribute('attributes'))['Form'] ?? '')), 'powder') === 0)
            ->pluck('id');

        $count = $ids->count();

        if ($count === 0) {
            $this->info('Nothing to update — no Powder variants with additional = 0 found.');
            return self::SUCCESS;
        }

        $this->info("Found {$count} Powder variant(s) with additional = 0. Updating...");

        $updated = 0;
        foreach ($ids->chunk(500) as $chunk) {
            $updated += ProductVariant::withTrashed()->whereIn('id', $chunk)->where('additional', 0)->update(['additional' => 100]);
        }

        $this->info("Done. {$updated} variant(s) updated to additional = 100.");

        return self::SUCCESS;
    }
}
