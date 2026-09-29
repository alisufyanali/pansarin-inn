<?php

namespace App\Console\Commands;

use App\Models\OrderItem;
use App\Models\SaleItem;
use Illuminate\Console\Command;

/**
 * Rewrites meta.variant_name on existing order/sale items to the current
 * label format ("250 gm / Powder", "30 ml", "1 Pc"). Older items were stored
 * as "250 / Powder gm" (unit at the end) or without the unit.
 *
 *   php artisan orders:fix-variant-labels --dry-run
 *   php artisan orders:fix-variant-labels
 */
class FixVariantLabels extends Command
{
    protected $signature = 'orders:fix-variant-labels {--dry-run : Show what would change without saving}';

    protected $description = 'Rebuild variant labels (with unit) stored on order and sale items';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $total  = 0;

        foreach ([OrderItem::class => 'order', SaleItem::class => 'sale'] as $model => $label) {
            $changed = 0;

            $model::query()
                ->whereNotNull('product_variant_id')
                ->with(['variant' => fn ($q) => $q->withTrashed(), 'product' => fn ($q) => $q->withTrashed()])
                ->chunkById(500, function ($items) use (&$changed, $dryRun, $label) {
                    foreach ($items as $item) {
                        if (! $item->variant) {
                            continue;
                        }

                        $meta = $item->meta ?? [];
                        $new  = $item->variant->label($item->product?->unit);
                        $old  = $meta['variant_name'] ?? null;

                        if ($new === '' || $old === $new) {
                            continue;
                        }

                        $changed++;
                        if ($changed <= 10) {
                            $this->line("  {$label} item #{$item->id}: " . var_export($old, true) . " → {$new}");
                        }

                        if (! $dryRun) {
                            $meta['variant_name'] = $new;
                            $item->forceFill(['meta' => $meta])->saveQuietly();
                        }
                    }
                });

            $this->info(ucfirst($label) . " items " . ($dryRun ? 'to update' : 'updated') . ": {$changed}");
            $total += $changed;
        }

        if ($dryRun) {
            $this->comment("Dry run — nothing saved ({$total} labels would change).");
        }

        return self::SUCCESS;
    }
}
