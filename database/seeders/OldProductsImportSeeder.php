<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OldProductsImportSeeder extends Seeder
{
    public function run(): void
    {
        $dataPath = database_path('seeders/data/products_clean.json');

        if (! file_exists($dataPath)) {
            $this->command->error("Data file not found: {$dataPath}");
            return;
        }

        $raw = file_get_contents($dataPath);
        $items = json_decode($raw, true);

        if (! is_array($items)) {
            $this->command->error('Failed to decode JSON file.');
            return;
        }

        $total = count($items);
        $this->command->info("Found {$total} products in JSON. Starting import...");

        // ── Counters ──────────────────────────────────────────────
        $catsCreated      = 0;
        $catsFound        = 0;
        $productsCreated  = 0;
        $productsSkipped  = 0;
        $variantsCreated  = 0;
        $inventoryCreated = 0;
        $skipped          = [];  // [slug => reason]

        // ── Step 1: Pre-build category map ─────────────────────────
        // Collect unique category names and firstOrCreate them upfront
        $categoryMap = []; // name => Category

        $uniqueCategoryNames = collect($items)
            ->pluck('category_name')
            ->filter()
            ->unique()
            ->values();

        foreach ($uniqueCategoryNames as $catName) {
            [$cat, $created] = $this->firstOrCreateCategory($catName);
            $categoryMap[$catName] = $cat;
            $created ? $catsCreated++ : $catsFound++;
        }

        $this->command->info(
            "Categories: {$catsCreated} created, {$catsFound} already existed."
        );

        // ── Step 2: Progress bar ───────────────────────────────────
        $bar = $this->command->getOutput()->createProgressBar($total);
        $bar->setFormat(' %current%/%max% [%bar%] %percent:3s%% — %message%');
        $bar->setMessage('starting...');
        $bar->start();

        // ── Step 3: Import products ───────────────────────────────
        foreach ($items as $index => $item) {
            $bar->setMessage($item['name'] ?? 'unknown');

            try {
                DB::transaction(function () use (
                    $item,
                    $categoryMap,
                    &$productsCreated,
                    &$productsSkipped,
                    &$variantsCreated,
                    &$inventoryCreated,
                    &$skipped
                ) {
                    $catName = $item['category_name'] ?? null;
                    $category = $catName ? ($categoryMap[$catName] ?? null) : null;

                    if (! $category) {
                        $skipped[$item['slug'] ?? $item['name']] = 'No category found: ' . $catName;
                        $productsSkipped++;
                        return;
                    }

                    // ── a. Find or create Attribute + AttributeValues ─
                    $variants   = $item['variants'] ?? [];
                    $attrMap    = []; // label => Attribute
                    $avMap      = []; // "{label}|{value}" => AttributeValue

                    if (! empty($variants)) {
                        foreach ($variants as $v) {
                            $label = trim($v['label'] ?? 'Weight');
                            $val   = (string) ($v['value'] ?? '');

                            // Attribute
                            if (! isset($attrMap[$label])) {
                                $attrMap[$label] = Attribute::firstOrCreate(
                                    ['category_id' => $category->id, 'name' => $label],
                                    ['slug' => Str::slug($label)]
                                );
                            }

                            // AttributeValue
                            $avKey = "{$label}|{$val}";
                            if (! isset($avMap[$avKey])) {
                                $avMap[$avKey] = AttributeValue::firstOrCreate(
                                    ['attribute_id' => $attrMap[$label]->id, 'value' => $val],
                                    ['slug' => Str::slug($val)]
                                );
                            }
                        }
                    }

                    // ── b. Create Product ─────────────────────────────
                    $slug = $item['slug'] ?? Str::slug($item['name']);

                    if (Product::where('slug', $slug)->exists()) {
                        $skipped[$slug] = 'Duplicate slug — already exists';
                        $productsSkipped++;
                        return;
                    }

                    $metaTitle = $item['meta_title'] ?? null;
                    if ($metaTitle && mb_strlen($metaTitle) > 60) {
                        $metaTitle = mb_substr($metaTitle, 0, 57) . '...';
                    }

                    $shortDesc = $item['overview'] ?? null;
                    if ($shortDesc && mb_strlen($shortDesc) > 500) {
                        $shortDesc = mb_substr($shortDesc, 0, 497) . '...';
                    }

                    $sku = $item['sku'] ?? null;
                    // Guard against duplicate SKU
                    if ($sku && Product::where('sku', $sku)->exists()) {
                        $sku = $sku . '-' . time() . rand(10, 99);
                    }

                    $product = Product::create([
                        'category_id'       => $category->id,
                        'name'              => $item['name'],
                        'urdu_name'         => $item['urdu_name'] ?? null,
                        'scientific_name'   => $item['scientific_name'] ?? null,
                        'slug'              => $slug,
                        'sku'               => $sku,
                        'unit'              => $item['unit'] ?? null,
                        'short_description' => $shortDesc,
                        'long_description'  => $item['description'] ?? null,
                        'featured'          => (bool) ($item['featured'] ?? false),
                        'status'            => true,
                        'meta_title'        => $metaTitle,
                        'meta_description'  => $item['meta_description'] ?? null,
                        'thumbnail'         => null,
                        'affiliate_commission' => 5.00,
                        'sort_order'        => 0,
                    ]);

                    $productsCreated++;

                    // ── c. Create Variants ────────────────────────────
                    $createdVariants = [];

                    if (! empty($variants)) {
                        foreach ($variants as $vIndex => $v) {
                            $label    = trim($v['label'] ?? 'Weight');
                            $val      = (string) ($v['value'] ?? '');
                            $avKey    = "{$label}|{$val}";
                            $av       = $avMap[$avKey] ?? null;
                            $unit     = $item['unit'] ?? '';
                            $varLabel = trim("{$val} {$unit}"); // e.g. "30 ml"

                            $varSku = $v['sku'] ?? ($sku . '-V' . str_pad($vIndex + 1, 2, '0', STR_PAD_LEFT));
                            // Guard against duplicate variant SKU
                            if (ProductVariant::withTrashed()->where('sku', $varSku)->exists()) {
                                $varSku = $varSku . '-' . substr(md5(uniqid()), 0, 6);
                            }

                            $variant = ProductVariant::create([
                                'product_id'         => $product->id,
                                'sku'                => $varSku,
                                'attribute_value_id' => $av?->id,
                                'value'              => $varLabel,
                                'attributes'         => [$label => $val],
                                'price'              => (float) ($v['price'] ?? 0),
                                'sale_price'         => null,
                                'is_default'         => ($vIndex === 0),
                                'status'             => true,
                                'stock_alert'        => 5,
                                'additional'         => 0,
                            ]);

                            $createdVariants[] = $variant;
                            $variantsCreated++;
                        }
                    } else {
                        // Fallback single variant for products with no variants array
                        $unit     = $item['unit'] ?? 'pc';
                        $varSku   = ($sku ?? $slug) . '-V01';
                        if (ProductVariant::withTrashed()->where('sku', $varSku)->exists()) {
                            $varSku = $varSku . '-' . substr(md5(uniqid()), 0, 6);
                        }

                        $variant = ProductVariant::create([
                            'product_id'         => $product->id,
                            'sku'                => $varSku,
                            'attribute_value_id' => null,
                            'value'              => '1 ' . $unit,
                            'attributes'         => null,
                            'price'              => (float) ($item['sale_price'] ?? 0),
                            'sale_price'         => null,
                            'is_default'         => true,
                            'status'             => true,
                            'stock_alert'        => 5,
                            'additional'         => 0,
                        ]);

                        $createdVariants[] = $variant;
                        $variantsCreated++;
                    }

                    // ── d. Inventory entries (never write product_stocks directly) ─
                    $stockQty = (int) ($item['current_stock'] ?? 0);

                    foreach ($createdVariants as $variant) {
                        Inventory::create([
                            'product_id'         => $product->id,
                            'product_variant_id' => $variant->id,
                            'type'               => 'in',
                            'quantity'           => $stockQty,
                            'source'             => 'manual',
                            'note'               => 'Imported from legacy database',
                        ]);
                        $inventoryCreated++;
                    }
                });
            } catch (\Throwable $e) {
                $slug = $item['slug'] ?? ($item['name'] ?? "item-{$index}");
                $skipped[$slug] = 'Exception: ' . $e->getMessage();
                $productsSkipped++;
            }

            $bar->advance();
        }

        $bar->setMessage('done');
        $bar->finish();
        $this->command->newLine(2);

        // ── Summary ───────────────────────────────────────────────
        $this->command->info('═══════════════════════════════════════════');
        $this->command->info('  IMPORT COMPLETE');
        $this->command->info('═══════════════════════════════════════════');
        $this->command->table(
            ['Metric', 'Count'],
            [
                ['Categories created',  $catsCreated],
                ['Categories found',    $catsFound],
                ['Products created',    $productsCreated],
                ['Products skipped',    $productsSkipped],
                ['Variants created',    $variantsCreated],
                ['Inventory entries',   $inventoryCreated],
            ]
        );

        if (! empty($skipped)) {
            $this->command->warn('Skipped products:');
            foreach ($skipped as $slug => $reason) {
                $this->command->warn("  • {$slug}: {$reason}");
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────

    /**
     * @return array{0: Category, 1: bool}  [category, wasCreated]
     */
    private function firstOrCreateCategory(string $name): array
    {
        $existing = Category::where('name', $name)->first();

        if ($existing) {
            return [$existing, false];
        }

        $slug = Str::slug($name);
        // Guard against slug collision (e.g. two different names with same slug)
        $baseSlug = $slug;
        $counter  = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        $cat = Category::create([
            'name'   => $name,
            'slug'   => $slug,
            'status' => true,
        ]);

        return [$cat, true];
    }
}
