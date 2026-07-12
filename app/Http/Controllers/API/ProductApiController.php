<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\CategoryRepository;
use App\Http\Repositories\Admin\ProductRepository;
use App\Models\HomepageCategoryProduct;
use App\Models\Product;
use App\Models\ProductStock;
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
        $query = Product::with(['category:id,name,slug', 'variants'])
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

        if ($request->filled('featured')) {
            $query->where('featured', true);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $sortBy    = in_array($request->get('sort_by'), ['price', 'name', 'created_at']) ? $request->get('sort_by') : 'created_at';
        $sortOrder = $request->get('sort_order', 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

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
        $products = Product::with(['category:id,name,slug', 'variants'])
            ->where('status', true)
            ->where('featured', true)
            ->latest()
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
        $product = Product::with(['category:id,name,slug', 'variants'])
            ->where('slug', $slug)
            ->where('status', true)
            ->firstOrFail();

        $stocks = $this->preloadStocks(collect([$product]));

        return response()->json([
            'success' => true,
            'data'    => $this->formatProduct($product, true, $stocks),
        ]);
    }

    // GET /api/products/with-video
    public function withVideo()
    {
        $products = Product::with(['category:id,name,slug', 'variants'])
            ->where('status', true)
            ->whereNotNull('video')
            ->where('video', '!=', '')
            ->orderByDesc('featured')
            ->latest()
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

    // GET /api/homepage/category-products
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

        $base = [
            'id'          => $p->id,
            'name'        => $p->name,
            'slug'        => $p->slug,
            'sku'         => $p->sku,
            'price'       => (float) $p->price,
            'sale_price'  => $p->sale_price ? (float) $p->sale_price : null,
            'unit'        => $p->unit,
            'featured'    => (bool) $p->featured,
            'thumbnail'   => $p->thumbnail ? asset('storage/' . $p->thumbnail) : null,
            'category'    => $p->category ? ['id' => $p->category->id, 'name' => $p->category->name, 'slug' => $p->category->slug] : null,
            'variants'    => $p->variants->map(fn ($v) => [
                'id'         => $v->id,
                'name'       => collect($v->attributes ?? [])->values()->join(' / ') ?: $v->value,
                'sku'        => $v->sku,
                'price'      => (float) ($v->sale_price ?? $v->price ?? $p->price),
                'stock'      => (int) ($stocks->get($p->id . '_' . $v->id)?->first()?->quantity ?? 0),
                'is_default' => (bool) $v->is_default,
            ]),
        ];

        if ($detailed) {
            $baseStock = $stocks->get($p->id . '_null')?->first()?->quantity;
            $base['description']  = $p->description;
            $base['excerpt']      = $p->excerpt ?? null;
            $base['gallery']      = collect($p->gallery ?? [])->map(fn ($img) => asset('storage/' . $img));
            $base['stock']        = $baseStock !== null ? (int) $baseStock : (int) ($p->quantity ?? 0);
            $base['meta_title']   = $p->meta_title ?? $p->name;
            $base['meta_desc']    = $p->meta_description ?? null;
        }

        return $base;
    }
}
