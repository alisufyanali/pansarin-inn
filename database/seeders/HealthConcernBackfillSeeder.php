<?php

namespace Database\Seeders;

use App\Models\HealthConcern;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Makes sure EVERY product appears under at least one "Shop by Health Concern".
 *
 * Runs after HealthConcernProductSeeder and only touches products that still
 * have no concern (existing links, including ones set by the admin, are kept):
 *   1. keyword match on name / Urdu name / descriptions
 *   2. otherwise a sensible default for the product's category
 *
 * Safe to re-run. Admins can refine the result in Products → Health Concerns.
 */
class HealthConcernBackfillSeeder extends Seeder
{
    /** Keywords per concern slug (subset of HealthConcernProductSeeder's rules). */
    private const KEYWORDS = [
        'hair'        => ['hair', 'zulf', 'lice', 'dandruff', 'bald', 'hairfall', 'alopecia', 'bhringraj', 'amla oil'],
        'skin'        => ['acne', 'scar', 'skin', 'complexion', 'glow', 'whitening', 'fairness', 'ubtan', 'face', 'facial', 'wrinkle', 'pimple', 'freckle', 'eczema'],
        'sleep'       => ['sleep', 'neend', 'tagar', 'jatamansi', 'valerian', 'kahu', 'insomnia'],
        'energy'      => ['energy', 'vitality', 'stamina', 'shilajit', 'musli', 'ginseng', 'ashwagandha', 'moringa', 'strength', 'weakness', 'fatigue', 'tonic'],
        'immunity'    => ['immune', 'immunity', 'giloy', 'guduchi', 'tulsi', 'neem', 'amla', 'haritaki', 'triphala', 'antioxidant', 'kadha', 'fever', 'infection'],
        'digestion'   => ['digest', 'stomach', 'acidity', 'ispaghol', 'laxative', 'constipation', 'gastric', 'ulcer', 'bloating', 'gas', 'appetite', 'liver', 'jaundice', 'worm'],
        'stress'      => ['stress', 'anxiety', 'calm', 'brahmi', 'shankhpushpi', 'nerve', 'mood', 'depression', 'memory', 'focus', 'brain'],
        'joints'      => ['joint', 'pain', 'arthritis', 'rheumat', 'gout', 'backache', 'muscle', 'sprain', 'inflammation', 'swelling', 'massage'],
        'hydration'   => ['detox', 'hydration', 'aloe', 'rose water', 'gulab', 'cooling', 'blood purif', 'kidney', 'urinary'],
        'weight'      => ['weight', 'slim', 'obesity', 'metabolism', 'cholesterol', 'belly'],
        'eye'         => ['eye', 'vision', 'surma', 'kajal', 'eyesight', 'cataract'],
        'respiratory' => ['respiratory', 'cough', 'asthma', 'lung', 'mulethi', 'licorice', 'chest', 'throat', 'common cold', 'flu', 'sinus', 'bronchitis', 'allergy'],
    ];

    /** Fallback concerns by category slug when no keyword matches. */
    private const CATEGORY_DEFAULTS = [
        'herb'          => ['immunity', 'digestion'],
        'oils'          => ['hair', 'skin', 'joints'],
        'supplements'   => ['energy', 'immunity'],
        'beauty-corner' => ['skin'],
        'dawakhana'     => ['immunity', 'digestion'],
        'remedies'      => ['immunity'],
        'dry-fruits'    => ['energy'],
        'herbal-tea'    => ['digestion', 'stress'],
        'combo-deals'   => ['immunity'],
        'seeds'         => ['digestion', 'energy'],
        'spices'        => ['digestion', 'immunity'],
        'spiecs'        => ['digestion', 'immunity'],
    ];

    private const DEFAULT_CONCERNS = ['immunity'];

    public function run(): void
    {
        $concernIds = HealthConcern::pluck('id', 'slug');
        if ($concernIds->isEmpty()) {
            $this->command?->error('No health concerns found. Run HealthConcernSeeder first.');
            return;
        }

        $byKeyword = 0;
        $byCategory = 0;
        $rows = [];

        Product::with('category:id,slug')
            ->doesntHave('healthConcerns')
            ->select(['id', 'category_id', 'name', 'urdu_name', 'short_description', 'long_description'])
            ->chunkById(200, function ($products) use ($concernIds, &$rows, &$byKeyword, &$byCategory) {
                foreach ($products as $product) {
                    $slugs = $this->matchKeywords($product);

                    if ($slugs) {
                        $byKeyword++;
                    } else {
                        $slugs = self::CATEGORY_DEFAULTS[$product->category?->slug] ?? self::DEFAULT_CONCERNS;
                        $byCategory++;
                    }

                    foreach ($slugs as $slug) {
                        if ($id = $concernIds->get($slug)) {
                            $rows[] = ['product_id' => $product->id, 'health_concern_id' => $id];
                        }
                    }
                }
            });

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('product_health_concern')->insertOrIgnore($chunk);
        }

        $this->command?->info("Health concerns backfilled: {$byKeyword} products by keyword, {$byCategory} by category ("
            . count($rows) . ' links).');
    }

    /** @return string[] concern slugs whose keywords appear in the product text (max 3). */
    private function matchKeywords(Product $product): array
    {
        $text = mb_strtolower(strip_tags(implode(' ', [
            $product->name, $product->urdu_name, $product->short_description, $product->long_description,
        ])));

        $matched = [];
        foreach (self::KEYWORDS as $slug => $keywords) {
            foreach ($keywords as $kw) {
                if (preg_match('/\b' . preg_quote($kw, '/') . '/u', $text)) {
                    $matched[] = $slug;
                    break;
                }
            }
        }

        return array_slice($matched, 0, 3);
    }
}
