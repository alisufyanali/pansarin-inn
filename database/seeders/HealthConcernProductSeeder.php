<?php

namespace Database\Seeders;

use App\Models\HealthConcern;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HealthConcernProductSeeder extends Seeder
{
    public function run(): void
    {
        $dataPath = database_path('seeders/data/products_clean.json');
        
        if (!file_exists($dataPath)) {
            $this->command->error("File not found: {$dataPath}");
            return;
        }

        $raw = file_get_contents($dataPath);
        $items = json_decode($raw, true);

        if (!$items || !is_array($items)) {
            $this->command->error("Invalid JSON in products_clean.json");
            return;
        }

        // Load all health concerns into memory
        $concerns = HealthConcern::all()->keyBy('slug');
        
        if ($concerns->isEmpty()) {
            $this->command->error("No Health Concern records found. Run HealthConcernSeeder first.");
            return;
        }

        $this->command->info("Loaded " . $concerns->count() . " health concerns.");

        // Keyword rules — same as analyze_products.php Analysis 2
        $rulesConfig = [
            'hair' => [
                'category_oils_only' => ['hair', 'zulf', 'lice', 'dandruff', 'balo', 'bald'],
                'any_category' => ['hairfall', 'hair loss', 'alopecia']
            ],
            'skin' => [
                'category_beauty_only' => true,
                'any_category' => ['acne', 'scars', 'skin', 'complexion', 'glow', 'whitening', 'fairness', 'ubtan', 'face', 'facial', 'wrinkle', 'anti-aging', 'anti aging']
            ],
            'sleep' => [
                'any_category' => ['sleep', 'neend', 'tagar', 'jatamansi', 'valerian', 'kahu', 'poppy', 'afim', 'sleepless', 'insomnia', 'rest', 'night', 'dream']
            ],
            'energy' => [
                'any_category' => ['energy', 'vitality', 'stamina', 'shilajit', 'musli', 'ginseng', 'ashwagandha', 'moringa', 'power', 'strength', 'weakness', 'fatigue', 'tired']
            ],
            'immunity' => [
                'any_category' => ['immune', 'immunity', 'chyawanprash', 'giloy', 'guduchi', 'tulsi', 'neem', 'amla', 'haritaki', 'triphala', 'antioxidant', 'kadha', 'defense']
            ],
            'digestion' => [
                'any_category' => ['digest', 'stomach', 'acidity', 'ispaghol', 'laxative', 'constipation', 'gastric', 'ulcer', 'ibs', 'bloating', 'gas', 'appetite', 'liver', 'hepatitis']
            ],
            'stress' => [
                'any_category' => ['stress', 'anxiety', 'calm', 'brahmi', 'shankhpushpi', 'calming', 'relax', 'nerve', 'mood', 'depression', 'tension', 'mental', 'memory', 'focus', 'concentration']
            ],
            'joints' => [
                'any_category' => ['joint', 'pain', 'arthritis', 'rheumatism', 'gout', 'backache', 'muscle', 'sprain', 'inflammation', 'swelling', 'massage', 'relief']
            ],
            'hydration' => [
                'any_category' => ['detox', 'hydration', 'water', 'aloe', 'alovera', 'rose water', 'gulab jal', 'moistur', 'dryness', 'dehydration', 'cooling', 'refresh']
            ],
            'weight' => [
                'any_category' => ['weight', 'fat', 'slim', 'obesity', 'overweight', 'diet', 'metabolism', 'calorie', 'inch loss', 'belly']
            ],
            'eye' => [
                'any_category' => ['eye', 'vision', 'surma', 'kajal', 'kohl', 'eyesight', 'cataract', 'retina', 'optic', 'dark circle', 'puffy']
            ],
            'respiratory' => [
                'any_category' => ['respiratory', 'cough', 'asthma', 'lung', 'mulethi', 'licorice', 'adrak', 'ginger', 'tulsi', 'basil', 'honey', 'chest', 'throat', 'cold', 'flu', 'sinus', 'breath', 'bronchitis', 'pneumonia', 'allergy', 'sneez']
            ]
        ];

        $matchedCount = 0;
        $zeroMatchCount = 0;
        $pivotInserts = [];

        foreach ($items as $item) {
            $name = $item['name'] ?? '';
            $cat = $item['category_name'] ?? '';
            $desc = $item['description'] ?? '';
            $oldId = $item['old_id'] ?? null;

            if (!$oldId) {
                continue;
            }

            // Find the actual product by old_id (products_clean.json was generated from old DB)
            $product = Product::where('id', $oldId)->first();
            
            if (!$product) {
                // Fallback: try matching by slug if old_id doesn't exist in current DB
                $slug = $item['slug'] ?? \Illuminate\Support\Str::slug($name);
                $product = Product::where('slug', $slug)->first();
            }

            if (!$product) {
                $this->command->warn("Product not found: [{$cat}] {$name} (old_id: {$oldId})");
                continue;
            }

            $searchText = strtolower($name . ' ' . $desc);
            $matchedConcerns = [];

            // Hair
            if (stripos($cat, 'Oils') !== false) {
                foreach ($rulesConfig['hair']['category_oils_only'] as $kw) {
                    if (preg_match('/\b' . preg_quote($kw, '/') . '/i', $searchText)) {
                        $matchedConcerns[] = 'hair';
                        break;
                    }
                }
            }
            foreach ($rulesConfig['hair']['any_category'] as $kw) {
                if (preg_match('/\b' . preg_quote($kw, '/') . '/i', $searchText)) {
                    $matchedConcerns[] = 'hair';
                    break;
                }
            }

            // Skin
            if (stripos($cat, 'Beauty Corner') !== false) {
                $matchedConcerns[] = 'skin';
            } else {
                foreach ($rulesConfig['skin']['any_category'] as $kw) {
                    if (preg_match('/\b' . preg_quote($kw, '/') . '/i', $searchText)) {
                        $matchedConcerns[] = 'skin';
                        break;
                    }
                }
            }

            // General concerns
            $generalConcerns = ['sleep', 'energy', 'immunity', 'digestion', 'stress', 'joints', 'hydration', 'weight', 'eye', 'respiratory'];
            foreach ($generalConcerns as $concern) {
                foreach ($rulesConfig[$concern]['any_category'] as $kw) {
                    if (preg_match('/\b' . preg_quote($kw, '/') . '/i', $searchText)) {
                        $matchedConcerns[] = $concern;
                        break;
                    }
                }
            }

            $matchedConcerns = array_unique($matchedConcerns);

            if (empty($matchedConcerns)) {
                $zeroMatchCount++;
                continue;
            }

            // Cap at max 3 concerns per product
            if (count($matchedConcerns) > 3) {
                // Priority: name-match first, then description-match
                // For simplicity, keep first 3 (order in array = priority order)
                $matchedConcerns = array_slice($matchedConcerns, 0, 3);
            }

            $matchedCount++;

            foreach ($matchedConcerns as $concernSlug) {
                if (!isset($concerns[$concernSlug])) {
                    continue;
                }
                
                $pivotInserts[] = [
                    'health_concern_id' => $concerns[$concernSlug]->id,
                    'product_id' => $product->id,
                ];
            }
        }

        // Bulk insert pivot records
        if (!empty($pivotInserts)) {
            // Chunk to avoid query size limits
            foreach (array_chunk($pivotInserts, 500) as $chunk) {
                DB::table('product_health_concern')->insert($chunk);
            }
        }

        $this->command->info("Health Concern linking complete!");
        $this->command->info("Products matched: {$matchedCount}");
        $this->command->info("Products with zero matches: {$zeroMatchCount}");
        $this->command->info("Pivot records created: " . count($pivotInserts));
    }
}
