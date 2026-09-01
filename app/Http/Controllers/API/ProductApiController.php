<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\CategoryRepository;
use App\Http\Repositories\Admin\ProductRepository;
use App\Models\HomepageCategoryProduct;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class ProductApiController extends Controller
{
    public function __construct(
        protected ProductRepository  $productRepo,
        protected CategoryRepository $categoryRepo,
    ) {}

    // GET /api/products
    public function index(Request $request)
    {
        $query = Product::with(['category:id,name,slug', 'variants', 'healthConcerns:id,name,slug'])
            ->withCount(['reviews as reviews_count' => fn ($q) => $q->where('status', true)])
            ->withAvg(['reviews as reviews_avg_rating' => fn ($q) => $q->where('status', true)], 'rating')
            ->where('status', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('health_concern_id')) {
            $query->whereHas('healthConcerns', function ($q) use ($request) {
                $q->where('health_concerns.id', $request->health_concern_id);
            });
        }

        if ($request->filled('featured')) {
            $query->where('featured', true);
        }

        if ($request->filled('min_price') || $request->filled('max_price')) {
            $query->where(function ($q) use ($request) {
                // Check if any active variant fits the price range
                $q->whereHas('variants', function ($sub) use ($request) {
                    $sub->where('status', true);
                    if ($request->filled('min_price')) {
                        $sub->where('price', '>=', $request->min_price);
                    }
                    if ($request->filled('max_price')) {
                        $sub->where('price', '<=', $request->max_price);
                    }
                })->orWhere(function ($sub) use ($request) {
                    // Fall back to product price if it has no variants
                    $sub->whereDoesntHave('variants');
                    if ($request->filled('min_price')) {
                        $sub->where('price', '>=', $request->min_price);
                    }
                    if ($request->filled('max_price')) {
                        $sub->where('price', '<=', $request->max_price);
                    }
                });
            });
        }

        // Default sort: name asc (alphabetical).
        // 'created_at' is still accepted via sort_by for any frontend that requests it explicitly.
        $sortBy    = in_array($request->get('sort_by'), ['price', 'name', 'created_at', 'rating']) ? $request->get('sort_by') : 'name';
        $sortOrder = $request->get('sort_order', 'asc') === 'desc' ? 'desc' : 'asc';

        if ($sortBy === 'price') {
            $query->orderBy(
                \App\Models\ProductVariant::select('price')
                    ->whereColumn('product_id', 'products.id')
                    ->where('status', true)
                    ->orderBy('price', 'asc')
                    ->limit(1),
                $sortOrder
            );
        } elseif ($sortBy === 'rating') {
            // reviews_avg_rating is already loaded by the withAvg() above (filtered to approved reviews)
            $query->orderBy('reviews_avg_rating', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $products = $query->paginate(min((int) $request->get('per_page', 15), 100));
        $stocks   = $this->preloadStocks($products->getCollection());

        return response()->json([
            'success' => true,
            'data'    => $products->map(fn ($p) => $this->formatProduct($p, false, $stocks)),
            'meta'    => [
                'total'        => $products->total(),
                'per_page'     => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
            ],
        ]);
    }

    // GET /api/products/featured
    public function featured()
    {
        $products = Product::with(['category:id,name,slug', 'variants', 'healthConcerns:id,name,slug'])
            ->where('status', true)
            ->where('featured', true)
            ->orderBy('name')
            ->take(12)
            ->get();

        $stocks = $this->preloadStocks($products);

        return response()->json([
            'success' => true,
            'data'    => $products->map(fn ($p) => $this->formatProduct($p, false, $stocks)),
        ]);
    }

    // GET /api/products/{slug}
    public function show(string $slug)
    {
        $product = Product::with(['category:id,name,slug', 'variants', 'healthConcerns:id,name,slug'])
            ->withCount(['reviews as reviews_count' => fn ($q) => $q->where('status', true)])
            ->withAvg(['reviews as reviews_avg_rating' => fn ($q) => $q->where('status', true)], 'rating')
            ->where('slug', $slug)
            ->where('status', true)
            ->firstOrFail();

        $stocks = $this->preloadStocks(collect([$product]));

        $data                   = $this->formatProduct($product, true, $stocks);
        $data['reviews_count']  = (int) ($product->reviews_count ?? 0);
        $data['avg_rating']     = round((float) ($product->reviews_avg_rating ?? 0), 1);

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // GET /api/products/with-video
    public function withVideo()
    {
        $products = Product::with(['category:id,name,slug', 'variants', 'healthConcerns:id,name,slug'])
            ->where('status', true)
            ->whereNotNull('video')
            ->where('video', '!=', '')
            ->orderByDesc('featured')   // featured products first within the set
            ->orderBy('name')           // then alphabetically
            ->take(12)
            ->get();

        $stocks = $this->preloadStocks($products);

        return response()->json([
            'success' => true,
            'data'    => $products->map(fn ($p) => array_merge(
                $this->formatProduct($p, false, $stocks),
                ['video' => $p->video]
            )),
        ]);
    }

    // GET /api/categories
    public function categories()
    {
        $categories = \App\Models\Category::where('status', true)
            ->withCount(['products' => fn ($q) => $q->where('status', true)])
            ->with('children:id,name,slug,image,parent_id')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'image', 'parent_id']);

        return response()->json([
            'success' => true,
            'data'    => $categories->map(fn ($c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'slug'           => $c->slug,
                'image'          => $c->image ? asset('storage/' . $c->image) : null,
                'products_count' => $c->products_count,
                'children'       => $c->children->map(fn ($ch) => [
                    'id'    => $ch->id,
                    'name'  => $ch->name,
                    'slug'  => $ch->slug,
                    'image' => $ch->image ? asset('storage/' . $ch->image) : null,
                ]),
            ]),
        ]);
    }

    // GET /api/products/recommended?exclude_id={product_id}
    public function recommended(Request $request)
    {
        $excludeId  = (int) $request->get('exclude_id', 0);
        $limit      = 8;
        $categoryId = null;

        // If exclude_id is provided, resolve the category of that product
        // so we can prefer same-category results.
        if ($excludeId > 0) {
            $categoryId = Product::where('id', $excludeId)
                ->where('status', true)
                ->value('category_id');
        }

        $baseQuery = fn () => Product::with(['category:id,name,slug', 'variants', 'healthConcerns:id,name,slug'])
            ->withAvg('reviews as rating_avg', 'rating')
            ->withCount('reviews as reviews_total')
            ->where('status', true)
            ->when($excludeId > 0, fn ($q) => $q->where('id', '!=', $excludeId));

        // ── Phase 1: same-category products ──────────────────────
        $sameCat = collect();
        if ($categoryId) {
            $sameCat = $baseQuery()
                ->where('category_id', $categoryId)
                ->inRandomOrder()
                ->limit($limit)
                ->get();
        }

        // ── Phase 2: fill remaining slots from other categories ──
        $products = $sameCat;
        $remaining = $limit - $sameCat->count();

        if ($remaining > 0) {
            $excludeIds = collect([$excludeId])
                ->merge($sameCat->pluck('id'))
                ->filter()
                ->unique()
                ->values();

            $others = $baseQuery()
                ->whereNotIn('id', $excludeIds)
                ->inRandomOrder()
                ->limit($remaining)
                ->get();

            $products = $sameCat->concat($others);
        }

        $stocks = $this->preloadStocks($products);

        return response()->json([
            'success' => true,
            'data'    => $products->map(fn ($p) => $this->formatProductWithAggregates($p, $stocks)),
        ]);
    }

    // GET /api/products/{slug}/related
    public function related(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->where('status', true)
            ->select(['id', 'category_id'])
            ->first();

        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $related = Product::with(['category:id,name,slug', 'variants', 'healthConcerns:id,name,slug'])
            ->withAvg('reviews as rating_avg', 'rating')
            ->withCount('reviews as reviews_total')
            ->where('status', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->orderBy('name')
            ->limit(8)
            ->get();

        $stocks = $this->preloadStocks($related);

        return response()->json([
            'success' => true,
            'data'    => $related->map(fn ($p) => $this->formatProductWithAggregates($p, $stocks)),
        ]);
    }
    public function homepageCategoryProducts()
    {
        $rows = HomepageCategoryProduct::with([
                'category:id,name,slug',
                'product.category:id,name,slug',
                'product.variants',
            ])
            ->orderBy('category_id')
            ->orderBy('sort_order')
            ->limit(50)
            ->get();

        // Pre-load stocks for all products in one query
        $products = $rows->map(fn ($r) => $r->product)->filter();
        $stocks   = $this->preloadStocks($products);

        $grouped = $rows->groupBy('category_id');

        $data = $grouped->map(function ($items) use ($stocks) {
            $firstItem = $items->first();
            $category  = $firstItem->category;

            return [
                'category' => [
                    'id'   => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ],
                'products' => $items
                    ->filter(fn ($item) => $item->product !== null)
                    ->map(fn ($item) => $this->formatProduct($item->product, false, $stocks))
                    ->values(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // POST /api/products/check-stock
    // Public endpoint — used by BOTH guest (localStorage) and logged-in carts to verify
    // live stock for a set of variants in a single round-trip.
    //
    // Request:  { "variant_ids": [123, 456, 789] }
    // Response: { "success": true, "data": [ { "variant_id": 123, "stock": 5, "in_stock": true }, ... ] }
    public function checkStock(Request $request)
    {
        $request->validate([
            'variant_ids'   => 'required|array|min:1|max:100',
            'variant_ids.*' => 'required|integer|min:1',
        ]);

        $variantIds = array_unique(array_map('intval', $request->variant_ids));

        // Confirm the requested variant IDs actually exist — unknown IDs are returned
        // with stock: 0 / in_stock: false rather than being silently omitted, so the
        // frontend always gets a complete 1-to-1 response for every ID it sent.
        $existingIds = ProductVariant::whereIn('id', $variantIds)
            ->where('status', true)
            ->whereNull('deleted_at')
            ->pluck('id')
            ->flip(); // id => index map for O(1) lookup

        // Single query for all stock records across the requested variants
        $stocks = ProductStock::whereIn('product_variant_id', $variantIds)
            ->get(['product_variant_id', 'quantity'])
            ->keyBy('product_variant_id');

        $data = array_map(function (int $variantId) use ($existingIds, $stocks) {
            // If the variant doesn't exist or is inactive, treat as 0 stock
            if (! $existingIds->has($variantId)) {
                return [
                    'variant_id' => $variantId,
                    'stock'      => 0,
                    'in_stock'   => false,
                ];
            }

            $qty = (int) ($stocks->get($variantId)?->quantity ?? 0);

            return [
                'variant_id' => $variantId,
                'stock'      => $qty,
                'in_stock'   => $qty > 0,
            ];
        }, $variantIds);

        return response()->json([
            'success' => true,
            'data'    => array_values($data),
        ]);
    }

    // ── Format wrapper for pre-aggregated queries ─────────────────
    // Used by recommended() and related() which load rating_avg and
    // reviews_total via withAvg/withCount — avoiding per-row N+1 queries.
    private function formatProductWithAggregates(Product $p, ?\Illuminate\Support\Collection $stocks = null): array
    {
        $formatted = $this->formatProduct($p, false, $stocks);

        // Override the N+1 fields with the batch-loaded aggregates.
        $formatted['rating']        = round((float) ($p->rating_avg ?? 0), 1);
        $formatted['reviews_count'] = (int) ($p->reviews_total ?? 0);

        return $formatted;
    }

    // ── Stock pre-loader — single query for a collection of products ──
    private function preloadStocks(\Illuminate\Support\Collection $products): \Illuminate\Support\Collection
    {
        $productIds = $products->pluck('id')->filter()->unique();
        if ($productIds->isEmpty()) {
            return collect();
        }

        return ProductStock::whereIn('product_id', $productIds)
            ->get()
            ->groupBy(function ($s) {
                return $s->product_id . '_' . ($s->product_variant_id ?? 'null');
            });
    }

    // ── Format Helper ─────────────────────────────────────────────
    private function formatProduct(Product $p, bool $detailed = false, ?\Illuminate\Support\Collection $stocks = null): array
    {
        // Fall back to live query only for single-product show() calls
        if ($stocks === null) {
            $stocks = $this->preloadStocks(collect([$p]));
        }

        // ── Variant sort ──────────────────────────────────────────
        // Primary:  Weight ascending (numeric portion only — handles "50 gm", "100 gm", bare "50")
        // Secondary: Form priority — Whole(0) before Powder(1), anything else last(99)
        // Products without Weight/Form attributes are unaffected (sort keys resolve to 0/99
        // for all variants, so they retain their original relative order).
        $formPriority = ['Whole' => 0, 'Powder' => 1];
        $variants = $p->variants->sortBy([
            fn ($v) => (int) filter_var($v->attributes['Weight'] ?? '0', FILTER_SANITIZE_NUMBER_INT),
            fn ($v) => $formPriority[$v->attributes['Form'] ?? ''] ?? 99,
        ])->values();

        $base = [
            'id'              => $p->id,
            'name'            => $p->name,
            'slug'            => $p->slug,
            'sku'             => $p->sku,
            'scientific_name' => $p->scientific_name,
            // products table has no price column — price lives entirely on variants.
            // Return the lowest active variant final_price (sale_price ?? price + additional)
            // so product cards always show a real "starting from" figure, never 0.
            'price'           => $p->variants->isNotEmpty()
                ? (float) $p->variants->min(fn ($v) => ($v->sale_price ?? $v->price) + ($v->additional ?? 0))
                : 0.0,
            // sale_price at product level is also not stored — expose null; individual
            // variants carry their own sale_price already in the variants array below.
            'sale_price'      => null,
            'unit'            => $p->unit,
            'featured'        => (bool) $p->featured,
            'thumbnail'       => $p->thumbnail ? asset('storage/' . $p->thumbnail) : null,
            'urdu_name'       => $p->urdu_name,
            // 'description' = short overview text (used on cards / list views)
            'description'     => $p->short_description,
            // 'long_description' = full admin-written content (used on detail page)
            'long_description' => $p->long_description,
            'rating'          => round((float) ($p->reviews_avg_rating ?? $p->reviews()->avg('rating') ?? 0), 1),
            'reviews_count'   => isset($p->reviews_count) ? (int) $p->reviews_count : $p->reviews()->where('status', true)->count(),
            'gallery'         => collect($p->gallery ?? [])->map(fn ($img) => asset('storage/' . $img)),
            'hover_image'     => isset($p->gallery[1]) ? asset('storage/' . $p->gallery[1]) : null,
            'category'        => $p->category ? [
                'id'   => $p->category->id,
                'name' => $p->category->name,
                'slug' => $p->category->slug,
            ] : null,
            'health_concerns' => $p->relationLoaded('healthConcerns')
                ? $p->healthConcerns->map(fn ($hc) => [
                    'id'   => $hc->id,
                    'name' => $hc->name,
                    'slug' => $hc->slug,
                ])->values()
                : [],
            'variants' => $variants->map(fn ($v) => [
                'id'          => $v->id,
                // 'name' = human-readable combined string e.g. "50 / Powder"
                'name'        => collect($v->attributes ?? [])->values()->join(' / ') ?: $v->value,
                // 'attributes' = structured object e.g. {"Weight":"50","Form":"Powder"}
                'attributes'  => $v->attributes ?? [],
                'sku'         => $v->sku,
                'unit'        => $p->unit,
                // base price before any additional charge
                'price'       => (float) ($v->sale_price ?? $v->price ?? 0),
                // additional surcharge for this variant (e.g. grinding fee) — 0 if none
                'additional'  => (int) ($v->additional ?? 0),
                // final_price = what the customer actually pays; frontend should use this
                'final_price' => (float) ($v->sale_price ?? $v->price ?? 0) + (int) ($v->additional ?? 0),
                'stock'       => (int) ($stocks->get($p->id . '_' . $v->id)?->first()?->quantity ?? 0),
                'is_default'  => (bool) $v->is_default,
            ]),
        ];

        if ($detailed) {
            $baseStock = $stocks->get($p->id . '_null')?->first()?->quantity;
            // In detailed mode, 'description' returns the full long description
            // for backward compatibility with any frontend already using the 'description' key.
            $base['description']  = $p->long_description;
            $base['excerpt']      = $p->short_description;
            $base['gallery']      = collect($p->gallery ?? [])->map(fn ($img) => asset('storage/' . $img));
            $base['stock']        = $baseStock !== null ? (int) $baseStock : (int) ($p->quantity ?? 0);
            $base['meta_title']   = $p->meta_title ?? $p->name;
            $base['meta_desc']    = $p->meta_description ?? null;
            $base['ingredients']  = $p->ingredients;
            $base['how_to_use']   = $p->how_to_use;
            $base['benefits']     = $p->benefits;
            $base['key_features'] = $p->key_features;
        }

        return $base;
    }
}
