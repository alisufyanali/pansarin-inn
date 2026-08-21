<?php

$dataPath = 'database/seeders/data/products_clean.json';
if (!file_exists($dataPath)) {
    die("File not found: {$dataPath}\n");
}

$raw = file_get_contents($dataPath);
$items = json_decode($raw, true);

if (!$items || !is_array($items)) {
    die("Invalid JSON or empty array\n");
}

// Check what fields are available in the first product
$firstItem = $items[0] ?? [];
$availableFields = array_keys($firstItem);
echo "=== Available fields in products_clean.json ===\n";
echo implode(', ', $availableFields) . "\n\n";

$hasDescription = in_array('description', $availableFields);
$hasIngredients = in_array('ingredients', $availableFields) || in_array('details', $availableFields);
$hasUses = in_array('uses', $availableFields);

echo "Has description: " . ($hasDescription ? 'YES' : 'NO') . "\n";
echo "Has ingredients/details: " . ($hasIngredients ? 'YES' : 'NO') . "\n";
echo "Has uses: " . ($hasUses ? 'YES' : 'NO') . "\n\n";

// ============================================================
// EXPANDED KEYWORD RULES
// ============================================================
$keywordsConfig = [
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

function matchProductWithBoundaries($name, $cat, $config) {
    $matched = [];
    $nameLower = strtolower($name);
    
    // Hair
    if (stripos($cat, 'Oils') !== false) {
        foreach ($config['hair']['category_oils_only'] as $kw) {
            if (preg_match('/\b' . preg_quote($kw, '/') . '/i', $name)) {
                $matched[] = 'hair';
                break;
            }
        }
    }
    foreach ($config['hair']['any_category'] as $kw) {
        if (preg_match('/\b' . preg_quote($kw, '/') . '/i', $name)) {
            $matched[] = 'hair';
            break;
        }
    }
    
    // Skin
    if (stripos($cat, 'Beauty Corner') !== false) {
        $matched[] = 'skin';
    } else {
        foreach ($config['skin']['any_category'] as $kw) {
            if (preg_match('/\b' . preg_quote($kw, '/') . '/i', $name)) {
                $matched[] = 'skin';
                break;
            }
        }
    }
    
    // General concerns - match keywords using word boundary \b
    $generalConcerns = ['sleep', 'energy', 'immunity', 'digestion', 'stress', 'joints', 'hydration', 'weight', 'eye', 'respiratory'];
    foreach ($generalConcerns as $concern) {
        $kws = $config[$concern]['any_category'];
        foreach ($kws as $kw) {
            if (preg_match('/\b' . preg_quote($kw, '/') . '/i', $name)) {
                $matched[] = $concern;
                break;
            }
        }
    }
    
    return array_unique($matched);
}

// ============================================================
// ANALYSIS 1: Match against NAME + CATEGORY only
// ============================================================
echo "========================================\n";
echo "ANALYSIS 1: Matching against NAME only\n";
echo "========================================\n\n";

$resultsNameOnly = [];
foreach ($keywordsConfig as $c => $_) {
    $resultsNameOnly[$c] = [];
}

$productsWithMatches = [];
$productsWithZeroMatches = [];

foreach ($items as $item) {
    $name = $item['name'] ?? '';
    $cat = $item['category_name'] ?? '';
    $matches = matchProductWithBoundaries($name, $cat, $keywordsConfig);
    
    if (empty($matches)) {
        $productsWithZeroMatches[] = "[{$cat}] {$name}";
    } else {
        $productsWithMatches[] = [
            'name' => "[{$cat}] {$name}",
            'concerns' => $matches
        ];
    }
    
    foreach ($matches as $m) {
        $resultsNameOnly[$m][] = "[{$cat}] {$name}";
    }
}

foreach ($resultsNameOnly as $concern => $matchedList) {
    echo "=== {$concern}: " . count($matchedList) . " matches ===\n";
    foreach ($matchedList as $item) {
        echo "  - {$item}\n";
    }
    echo "\n";
}

echo "=== SUMMARY (Name Only) ===\n";
echo "Total products: " . count($items) . "\n";
echo "Products with at least 1 match: " . count($productsWithMatches) . "\n";
echo "Products with ZERO matches: " . count($productsWithZeroMatches) . "\n\n";

// Multi-concern products
$multiConcern = array_filter($productsWithMatches, fn($p) => count($p['concerns']) > 1);
echo "Products matched by MULTIPLE concerns: " . count($multiConcern) . "\n";
foreach ($multiConcern as $p) {
    echo "  - " . $p['name'] . " => [" . implode(', ', $p['concerns']) . "]\n";
}
echo "\n";

// ============================================================
// ANALYSIS 2: Match against NAME + DESCRIPTION + INGREDIENTS
// ============================================================
if ($hasDescription || $hasIngredients || $hasUses) {
    echo "========================================\n";
    echo "ANALYSIS 2: Matching against NAME + DESCRIPTION + INGREDIENTS\n";
    echo "========================================\n\n";
    
    $resultsFull = [];
    foreach ($keywordsConfig as $c => $_) {
        $resultsFull[$c] = [];
    }
    
    $productsWithMatchesFull = [];
    $productsWithZeroMatchesFull = [];
    
    foreach ($items as $item) {
        $name = $item['name'] ?? '';
        $cat = $item['category_name'] ?? '';
        $desc = $item['description'] ?? '';
        $ingredients = $item['ingredients'] ?? $item['details'] ?? '';
        $uses = $item['uses'] ?? '';
        
        $searchText = $name . ' ' . $desc . ' ' . $ingredients . ' ' . $uses;
        $matches = matchProductWithBoundaries($searchText, $cat, $keywordsConfig);
        
        if (empty($matches)) {
            $productsWithZeroMatchesFull[] = "[{$cat}] {$name}";
        } else {
            $productsWithMatchesFull[] = [
                'name' => "[{$cat}] {$name}",
                'concerns' => $matches
            ];
        }
        
        foreach ($matches as $m) {
            $resultsFull[$m][] = "[{$cat}] {$name}";
        }
    }
    
    foreach ($resultsFull as $concern => $matchedList) {
        echo "=== {$concern}: " . count($matchedList) . " matches ===\n";
        foreach ($matchedList as $item) {
            echo "  - {$item}\n";
        }
        echo "\n";
    }
    
    echo "=== SUMMARY (Name + Description + Ingredients) ===\n";
    echo "Total products: " . count($items) . "\n";
    echo "Products with at least 1 match: " . count($productsWithMatchesFull) . "\n";
    echo "Products with ZERO matches: " . count($productsWithZeroMatchesFull) . "\n\n";
    
    $multiConcernFull = array_filter($productsWithMatchesFull, fn($p) => count($p['concerns']) > 1);
    echo "Products matched by MULTIPLE concerns: " . count($multiConcernFull) . "\n";
    foreach ($multiConcernFull as $p) {
        echo "  - " . $p['name'] . " => [" . implode(', ', $p['concerns']) . "]\n";
    }
    echo "\n";
    
    echo "=== COMPARISON ===\n";
    echo "Name-only matches: " . count($productsWithMatches) . "\n";
    echo "Full-text matches: " . count($productsWithMatchesFull) . "\n";
    echo "Additional products matched with full-text: " . (count($productsWithMatchesFull) - count($productsWithMatches)) . "\n";
}
