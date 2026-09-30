<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;

/**
 * "Did you mean …?" for product search. Herb names are spelt many ways
 * (ashwaganda / ashwgandha / ashwagandha), so when a search finds nothing
 * we offer the closest product names by edit distance, with a sound-alike
 * (metaphone) match as a fallback.
 */
class SearchSuggestionService
{
    public const CACHE_KEY = 'search_suggest_terms_v1';

    /**
     * @return array<int, array{name: string, slug: string}>
     */
    public function suggest(string $query, int $limit = 3): array
    {
        $q = $this->normalize($query);
        if (mb_strlen($q) < 3) {
            return [];
        }

        $qWords   = array_values(array_filter(explode(' ', $q), fn ($w) => mb_strlen($w) >= 3));
        $maxDist  = max(1, intdiv(mb_strlen($q), 4));
        $qSound   = metaphone(str_replace(' ', '', $q));
        $scored   = [];

        foreach ($this->terms() as $product) {
            $best = PHP_INT_MAX;
            foreach ($product['terms'] as $term) {
                // Whole query vs whole name / alias
                $best = min($best, levenshtein($q, $term));

                // Every query word must be close to some word of the name ("moringa powdr"
                // must not match every "… Powder"); score = sum of those distances
                $termWords = array_filter(explode(' ', $term), fn ($tw) => mb_strlen($tw) >= 3);
                if ($qWords && $termWords) {
                    $sum = 0;
                    foreach ($qWords as $w) {
                        $d = min(array_map(fn ($tw) => levenshtein($w, $tw), $termWords));
                        if ($d > max(1, intdiv(mb_strlen($w), 4))) {
                            $sum = PHP_INT_MAX;
                            break;
                        }
                        $sum += $d;
                    }
                    $best = min($best, $sum);
                }

                if ($qSound !== '' && metaphone(str_replace(' ', '', $term)) === $qSound) {
                    $best = min($best, $maxDist);
                }
            }

            if ($best <= $maxDist) {
                $scored[] = ['dist' => $best, 'name' => $product['name'], 'slug' => $product['slug']];
            }
        }

        usort($scored, fn ($a, $b) => [$a['dist'], $a['name']] <=> [$b['dist'], $b['name']]);

        return array_map(
            fn ($s) => ['name' => $s['name'], 'slug' => $s['slug']],
            array_slice($scored, 0, $limit)
        );
    }

    /** Active products with their searchable names, normalised. Cached 10 minutes. */
    private function terms(): array
    {
        return Cache::remember(self::CACHE_KEY, 600, function () {
            return Product::where('status', true)
                ->get(['name', 'slug', 'other_name', 'alternative_name', 'scientific_name'])
                ->map(fn ($p) => [
                    'name'  => $p->name,
                    'slug'  => $p->slug,
                    'terms' => array_values(array_unique(array_filter(array_map(
                        fn ($n) => $this->normalize((string) $n),
                        [$p->name, $p->other_name, $p->alternative_name, $p->scientific_name]
                    )))),
                ])
                ->all();
        });
    }

    private function normalize(string $s): string
    {
        $s = mb_strtolower($s);
        $s = preg_replace('/[^a-z0-9 ]+/', ' ', $s) ?? '';

        return trim(preg_replace('/\s+/', ' ', $s) ?? '');
    }
}
