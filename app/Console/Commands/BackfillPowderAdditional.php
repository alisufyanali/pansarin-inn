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
        // SQLite supports JSON path extraction via json_extract().
        // Laravel's whereJsonContains works on SQLite for simple scalar matches.
        $query = ProductVariant::query()
            ->where('additional', 0)
            ->whereRaw(
                // Case-insensitive: lower(json_extract(...)) = 'powder'
                "lower(json_extract(attributes, '$.Form')) = 'powder'"
            )
            ->withTrashed(); // include soft-deleted rows — backfill data integrity

        $count = $query->count();

        if ($count === 0) {
            $this->info('Nothing to update — no Powder variants with additional = 0 found.');
            return self::SUCCESS;
        }

        $this->info("Found {$count} Powder variant(s) with additional = 0. Updating...");

        // Update in one query for performance
        $updated = $query->update(['additional' => 100]);

        $this->info("Done. {$updated} variant(s) updated to additional = 100.");

        return self::SUCCESS;
    }
}
