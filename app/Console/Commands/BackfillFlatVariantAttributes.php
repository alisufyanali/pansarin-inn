<?php

namespace App\Console\Commands;

use App\Models\ProductVariant;
use Illuminate\Console\Command;

class BackfillFlatVariantAttributes extends Command
{
    /**
     * Idempotent one-time backfill:
     *
     * Certain products were imported via products_clean.json using a FLAT
     * variant structure (keys: "label", "value", "price", "sku") rather than
     * the indexed format ("label_1"/"value_1") that OldProductsImportSeeder
     * parses. The seeder only handles the indexed format, so these variants
     * were created with correct prices/SKUs but empty attributes ({} or []).
     *
     * This command applies the exact label→value pairs recovered from
     * products_clean.json, keyed precisely by SKU. No JSON re-parsing is
     * performed — the map is hard-coded from the verified source data.
     *
     * Attribute convention (matches existing DB records, e.g. Lahori Salt):
     *   - Bare numeric string values, no unit suffix baked in
     *   - Oils   → label "Size"  (volume in ml, e.g. "30", "60", "120")
     *   - Powders → label "Pack" (weight in gm, e.g. "100", "250")
     *
     * Guard: only updates variants where attributes IS NULL, '{}', or '[]'
     * — will NOT overwrite any variant that already has attribute data.
     *
     * Safe to re-run: the empty-attributes guard makes it idempotent.
     */
    protected $signature = 'backfill:flat-variant-attributes
                            {--dry-run : Print what would be updated without writing to the database}';

    protected $description = 'Backfill attributes on variants that were imported from the flat label/value JSON format';

    /**
     * The exact backfill map: SKU → attributes array.
     *
     * Source: database/seeders/data/products_clean.json
     * Verified against DB via investigation on 2026-08-30.
     */
    private array $backfillMap = [
        // ── Ginger Oil (3 variants) ───────────────────────────────────
        'GINGEROIL-V01'     => ['Size' => '30'],
        'GINGEROIL-V02'     => ['Size' => '60'],
        'GINGEROIL-V03'     => ['Size' => '120'],

        // ── Apricot Oil (3 variants) ──────────────────────────────────
        'APRICOTOIL-V01'    => ['Size' => '30'],
        'APRICOTOIL-V02'    => ['Size' => '60'],
        'APRICOTOIL-V03'    => ['Size' => '120'],

        // ── Pakhan Baid Oil (3 variants) ──────────────────────────────
        'PAKHANBAIDOIL-V01' => ['Size' => '30'],
        'PAKHANBAIDOIL-V02' => ['Size' => '60'],
        'PAKHANBAIDOIL-V03' => ['Size' => '120'],

        // ── Turmeric Oil (3 variants) ─────────────────────────────────
        'TURMERICOIL-V01'   => ['Size' => '30'],
        'TURMERICOIL-V02'   => ['Size' => '60'],
        'TURMERICOIL-V03'   => ['Size' => '120'],

        // ── Twelve Seeds Oil (3 variants) ─────────────────────────────
        'TWELVESEEDOIL-V01' => ['Size' => '30'],
        'TWELVESEEDOIL-V02' => ['Size' => '60'],
        'TWELVESEEDOIL-V03' => ['Size' => '120'],

        // ── Asrol Powder - Choti Chandan Powder (2 variants) ─────────
        'ASROLPOWDER-V01'   => ['Pack' => '100'],
        'ASROLPOWDER-V02'   => ['Pack' => '250'],

        // ── Manjistha - Majith Powder, new-format variants (2 variants)
        // Note: MANJISTHA-V01/V02 (old-format, Weight 50/100) are already
        // correctly populated and are NOT in this map.
        'MANJISTHAPOWDER-V01' => ['Pack' => '100'],
        'MANJISTHAPOWDER-V02' => ['Pack' => '250'],
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if ($dryRun) {
            $this->warn('DRY-RUN mode — no database writes will occur.');
        }

        $this->newLine();

        $skus         = array_keys($this->backfillMap);
        $updated      = 0;
        $skipped      = 0;
        $notFound     = 0;
        $alreadyFilled = 0;

        // Fetch all matching variants in one query (withTrashed for completeness)
        $variants = ProductVariant::withTrashed()
            ->whereIn('sku', $skus)
            ->get()
            ->keyBy('sku');

        foreach ($this->backfillMap as $sku => $newAttributes) {
            $variant = $variants->get($sku);

            if (! $variant) {
                $this->line("  <fg=yellow>NOT FOUND</>  {$sku}");
                $notFound++;
                continue;
            }

            // Guard: skip if attributes already has data
            $existing = $variant->attributes;
            $isEmpty  = $this->isEmpty($existing);

            if (! $isEmpty) {
                $this->line("  <fg=cyan>SKIP (already has data)</>  {$sku}  →  " . json_encode($existing));
                $alreadyFilled++;
                continue;
            }

            $newJson  = json_encode($newAttributes);
            $newValue = implode(' - ', array_values($newAttributes));

            if ($dryRun) {
                $this->line("  <fg=green>WOULD UPDATE</>  {$sku}  →  attributes={$newJson}  value=\"{$newValue}\"  (price={$variant->price})");
            } else {
                $variant->attributes = $newAttributes;
                $variant->value      = $newValue;
                $variant->save();
                $this->line("  <fg=green>UPDATED</>  {$sku}  →  attributes={$newJson}  value=\"{$newValue}\"");
            }

            $updated++;
        }

        $this->newLine();

        // Summary table
        $action = $dryRun ? 'Would update' : 'Updated';
        $this->table(
            ['Result', 'Count'],
            [
                [$action,              $updated],
                ['Already populated',  $alreadyFilled],
                ['SKU not in DB',      $notFound],
                ['Total in map',       count($this->backfillMap)],
            ]
        );

        if ($dryRun && $updated > 0) {
            $this->newLine();
            $this->info("Re-run without --dry-run to apply {$updated} update(s).");
        } elseif (! $dryRun && $updated > 0) {
            $this->info("Backfill complete. {$updated} variant(s) updated.");
        } elseif ($updated === 0 && $alreadyFilled === count($this->backfillMap)) {
            $this->info('Nothing to do — all variants already have attribute data.');
        }

        return self::SUCCESS;
    }

    /**
     * Returns true when the stored attributes value is effectively empty:
     * null, empty array [], empty object {}, or a blank/whitespace string.
     */
    private function isEmpty(mixed $existing): bool
    {
        if ($existing === null) {
            return true;
        }

        // The model casts 'attributes' as array; after cast it will be [] for
        // both '[]' and '{}' stored values.
        if (is_array($existing) && count($existing) === 0) {
            return true;
        }

        // Fallback for un-cast string access
        if (is_string($existing) && in_array(trim($existing), ['', '[]', '{}'], true)) {
            return true;
        }

        return false;
    }
}
