<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * Fills the four "Product Detail Tabs" (ingredients, how_to_use, benefits,
 * key_features) for every product.
 *
 * - Only EMPTY tabs are filled — anything an admin has written is kept.
 * - Content is built from the product's own data (name, scientific / Urdu /
 *   other names, forms and pack sizes from variants, category, health
 *   concerns), so nothing product-specific is invented. Benefits are phrased
 *   as traditional use, and usage notes defer to a hakeem/physician.
 * - Run HealthConcernProductSeeder + HealthConcernBackfillSeeder first so
 *   benefits can use each product's concerns. Safe to re-run.
 *
 * Shapes match the storefront (types/product.ts) and the admin form:
 *   ingredients  [{label, value}]
 *   how_to_use   {steps: string[], notes: string[]}
 *   benefits     string[]
 *   key_features [{icon: leaf|shield|check|bolt, title, sub, color: green|blue|amber|purple}] (max 4)
 */
class ProductDetailTabsSeeder extends Seeder
{
    private const BENEFITS = [
        'hair'        => 'Traditionally used in hair-care routines for healthy-looking hair and scalp.',
        'skin'        => 'Traditionally used in skin-care routines for clear, healthy-looking skin.',
        'sleep'       => 'Traditionally used to support restful sleep.',
        'energy'      => 'Traditionally used to support energy and everyday vitality.',
        'immunity'    => "Traditionally used to support the body's natural defences.",
        'digestion'   => 'Traditionally used to support healthy digestion.',
        'stress'      => 'Traditionally used to support calm and mental well-being.',
        'joints'      => 'Traditionally used to soothe joints and muscles.',
        'hydration'   => 'Traditionally used for its cooling and cleansing properties.',
        'weight'      => 'Traditionally used as part of weight-management routines.',
        'eye'         => 'Traditionally used in eye-care routines.',
        'respiratory' => 'Traditionally used to support throat and respiratory comfort.',
    ];

    private const COMMON_NOTES = [
        'Consult a qualified hakeem or physician before use if you are pregnant, nursing or taking medication.',
        'Keep out of reach of children.',
        'Store in a cool, dry place away from direct sunlight.',
    ];

    public function run(): void
    {
        $filled = ['ingredients' => 0, 'how_to_use' => 0, 'benefits' => 0, 'key_features' => 0];

        Product::with(['category:id,slug,name', 'variants', 'healthConcerns:id,slug,name'])
            ->chunkById(100, function ($products) use (&$filled) {
                foreach ($products as $product) {
                    $updates = [];
                    foreach (array_keys($filled) as $tab) {
                        if (! empty($product->{$tab})) {
                            continue; // keep admin / existing content
                        }
                        $updates[$tab] = $this->{'build' . str_replace('_', '', ucwords($tab, '_'))}($product);
                        $filled[$tab]++;
                    }
                    if ($updates) {
                        $product->timestamps = false;
                        $product->update($updates);
                    }
                }
            });

        $this->command?->info('Product detail tabs filled: ' . json_encode($filled));
    }

    // ── Builders ──────────────────────────────────────────────────

    private function buildIngredients(Product $p): array
    {
        $rows = [['label' => 'Product', 'value' => $p->name]];

        foreach ([
            'Scientific Name' => $p->scientific_name,
            'Urdu Name'       => $p->urdu_name,
            'Also Known As'   => $p->alternative_name ?: $p->other_name,
        ] as $label => $value) {
            if (filled($value)) {
                $rows[] = ['label' => $label, 'value' => trim(strip_tags((string) $value))];
            }
        }

        $forms = $p->variants->map(fn ($v) => $v->attributes['Form'] ?? null)->filter()->unique()->values();
        if ($forms->isNotEmpty()) {
            $rows[] = ['label' => 'Available Forms', 'value' => $forms->implode(', ')];
        }

        $sizes = $p->variants
            ->map(fn ($v) => collect($v->attributes ?? [])->except('Form')->first())
            ->filter(fn ($s) => $s !== null && $s !== '')
            ->unique()
            ->sort(SORT_NATURAL)
            ->values();
        if ($sizes->isNotEmpty()) {
            $rows[] = ['label' => 'Pack Sizes', 'value' => $sizes->implode(', ') . ($p->unit ? ' ' . $p->unit : '')];
        }

        return $rows;
    }

    private function buildHowToUse(Product $p): array
    {
        $category = $p->category?->slug;
        $isOil    = $category === 'oils' || in_array(strtolower((string) $p->unit), ['ml', 'l'], true);

        if ($isOil) {
            return [
                'steps' => [
                    'Take a few drops on your palm.',
                    'Massage gently onto the skin, scalp or affected area.',
                    'Leave on for at least 30 minutes (or overnight), then wash off.',
                ],
                'notes' => array_merge(['For external use only unless the label says otherwise.', 'Do a patch test before first use.'], self::COMMON_NOTES),
            ];
        }

        $steps = match ($category) {
            'spices', 'spiecs' => [
                'Use in cooking as needed — whole or freshly ground.',
                'Add to curries, rice, tea or marinades for flavour and aroma.',
                'Keep the pack tightly closed after opening.',
            ],
            'beauty-corner' => [
                'Apply to clean skin or hair.',
                'Leave on as directed, then rinse with lukewarm water.',
                'Use regularly for best results.',
            ],
            'herbal-tea' => [
                'Add to a cup of freshly boiled water.',
                'Steep for 5–7 minutes, then strain.',
                'Sweeten with honey if you like.',
            ],
            'supplements', 'dawakhana', 'remedies' => [
                'Use as directed on the pack or by your hakeem/physician.',
                'Do not exceed the recommended amount.',
            ],
            // Herbs include minerals and strong actives, so no generic
            // "take with …" instruction — dosage is left to a hakeem.
            default => [ // herbs, seeds, dry fruits
                'Clean the product before use.',
                'Use whole, or grind into powder as required.',
                'Use only as advised by a qualified hakeem or physician.',
            ],
        };

        return ['steps' => $steps, 'notes' => self::COMMON_NOTES];
    }

    private function buildBenefits(Product $p): array
    {
        $benefits = $p->healthConcerns
            ->map(fn ($c) => self::BENEFITS[$c->slug] ?? null)
            ->filter()
            ->take(4)
            ->values()
            ->all();

        $benefits[] = '100% natural ' . strtolower($p->category?->name ?? 'herbal') . ' product from Pansari Inn.';

        return $benefits;
    }

    private function buildKeyFeatures(Product $p): array
    {
        $concern = $p->healthConcerns->first();

        return [
            ['icon' => 'leaf',   'title' => '100% Natural',    'sub' => 'Pure & natural',            'color' => 'green'],
            ['icon' => 'shield', 'title' => 'Quality Checked', 'sub' => 'Carefully packed',          'color' => 'blue'],
            ['icon' => 'check',  'title' => $concern?->name ?? 'Traditional Use', 'sub' => 'Traditional use', 'color' => 'amber'],
            ['icon' => 'bolt',   'title' => 'Fast Delivery',   'sub' => 'Nationwide, 2–4 days',      'color' => 'purple'],
        ];
    }
}
