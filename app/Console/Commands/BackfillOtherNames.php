<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

class BackfillOtherNames extends Command
{
    /**
     * Idempotent one-time backfill:
     *
     * The old site (pansariinn.pk) showed "Other Name" on product pages, but
     * products_clean.json has no other-name field — the value only lives inside
     * each product's overview text, e.g.
     *   "Scientific Name: Linum usitatissimum Urdu: السی Other Names: Lin Seed , Barz Etc"
     * so OldProductsImportSeeder never filled `other_name`.
     *
     * Products are matched by slug (the import kept the JSON slugs). Only
     * products whose other_name is empty are written — anything the admin
     * already entered is never overwritten. Safe to re-run.
     */
    protected $signature = 'backfill:other-names
                            {--dry-run : Print what would be updated without writing to the database}';

    protected $description = 'Fill empty product other_name from the "Other Names:" line of the old-site overview';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $path   = database_path('seeders/data/products_clean.json');

        if (! file_exists($path)) {
            $this->error("Data file not found: {$path}");
            return self::FAILURE;
        }

        $map = self::otherNamesBySlug(json_decode(file_get_contents($path), true) ?? []);

        if ($dryRun) {
            $this->warn('DRY-RUN mode — no database writes will occur.');
        }

        $updated = $alreadyFilled = $notFound = 0;
        $products = Product::withTrashed()->whereIn('slug', array_keys($map))->get()->keyBy('slug');

        foreach ($map as $slug => $otherName) {
            $product = $products->get($slug);

            if (! $product) {
                $notFound++;
                continue;
            }

            if (trim((string) $product->other_name) !== '') {
                $alreadyFilled++;
                continue;
            }

            $this->line(sprintf('  <fg=green>%s</>  %s  →  %s', $dryRun ? 'WOULD UPDATE' : 'UPDATED', $slug, $otherName));

            if (! $dryRun) {
                // Quiet save: a data fix, not an admin edit
                $product->other_name = $otherName;
                $product->saveQuietly();
            }

            $updated++;
        }

        $this->newLine();
        $this->table(['Result', 'Count'], [
            [$dryRun ? 'Would update' : 'Updated', $updated],
            ['Already had other_name', $alreadyFilled],
            ['Slug not in DB', $notFound],
            ['Other names found in JSON', count($map)],
        ]);

        if ($dryRun && $updated > 0) {
            $this->info("Re-run without --dry-run to apply {$updated} update(s).");
        }

        return self::SUCCESS;
    }

    /**
     * slug => other name, for every old-site item whose overview has a
     * non-empty "Other Name(s):" value.
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array<string, string>
     */
    public static function otherNamesBySlug(array $items): array
    {
        $map = [];

        foreach ($items as $item) {
            $slug = $item['slug'] ?? null;
            $name = self::extractOtherName((string) ($item['overview'] ?? ''));

            if ($slug && $name !== null) {
                $map[$slug] = $name;
            }
        }

        return $map;
    }

    /**
     * The text after "Other Name(s):" up to the next heading. Null when the
     * line is missing, empty (e.g. "Other Names: Urdu Name : کاجو") or runs on
     * into the description.
     */
    public static function extractOtherName(string $overview): ?string
    {
        $pattern = '/Other\s+Names?\s*:\s*(.*?)\s*(?=Urdu\s*(?:Name)?\s*:|Scientific\s*Name|Overview|Benefits|Description|Usage|Uses|\n|$)/iu';

        if (! preg_match($pattern, $overview, $m)) {
            return null;
        }

        $value = trim($m[1], " ,.-:\t");

        // Longer than this is description text that leaked in, not a name list
        return $value === '' || mb_strlen($value) > 120 ? null : $value;
    }
}
