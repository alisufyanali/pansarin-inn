<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Category;
use App\Models\HomepageCategoryProduct;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductStock;
use App\Models\Slide;
use Illuminate\Support\Facades\Cache;

class HomepageApiController extends Controller
{
    // GET /api/homepage — single combined endpoint
    public function index()
    {
        // Cache key includes a version suffix so adding new keys doesn't serve
        // stale responses that are missing the new_arrivals field.
        $data = Cache::remember('homepage_data_v3', 300, function () {
            return [
                'banners'           => $this->getBanners(),
                'categories'        => $this->getCategories(),
                'category_products' => $this->getCategoryProducts(),
                'featured_products' => $this->getFeaturedProducts(),
                'new_arrivals'      => $this->getNewArrivals(),
                'video_products'    => $this->getVideoProducts(),
                'reviews'           => $this->getReviewsData(),
                'blogs'             => $this->getBlogs(),
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    // GET /api/slides — public banners/slides endpoint
    public function slides()
    {
        $data = Cache::remember('slides_data', 300, fn () => $this->getBanners());

        return response()->json(['success' => true, 'data' => $data]);
    }

    // GET /api/homepage/reviews
    public function reviews()
    {
        return response()->json([
            'success' => true,
            'data'    => $this->getReviewsData(),
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function getBanners(): array
    {
        return Slide::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($s) => [
                'id'         => $s->id,
                'type'       => $s->type,
                'title'      => $s->title,
                'subtitle'   => $s->subtitle,
                'btn_text'   => $s->btn_text,
                'btn_url'    => $s->btn_url,
                'image'      => $s->image ? asset('storage/' . $s->image) : null,
                'sort_order' => $s->sort_order,
            ])
            ->toArray();
    }

    private function getCategories(): array
    {
        return Category::where('status', true)
            ->withCount(['products' => fn ($q) => $q->where('status', true)])
            ->with('children:id,name,slug,image,parent_id')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'image', 'parent_id'])
            ->map(fn ($c) => [
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
                ])->toArray(),
            ])
            ->toArray();
    }

    private function getCategoryProducts(): array
    {
        $rows = HomepageCategoryProduct::with([
                'category:id,name,slug',
                'product.category:id,name,slug',
                'product.variants',
            ])
            ->orderBy('category_id')
            ->orderBy('sort_order')
            ->get();

        $products = $rows->map(fn ($r) => $r->product)->filter();
        $stocks   = $this->preloadStocks($products);

        return $rows->groupBy('category_id')
            ->map(function ($items) use ($stocks) {
                $category = $items->first()->category;

                return [
                    'category' => [
                        'id'   => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                    ],
                    'products' => $items
                        ->filter(fn ($item) => $item->product !== null)
                        ->map(fn ($item) => $this->formatProduct($item->product, $stocks))
                        ->values()
                        ->toArray(),
                ];
            })
            ->values()
            ->toArray();
    }

    private function getFeaturedProducts(): array
    {
        $products = Product::with(['category:id,name,slug', 'variants'])
            ->where('status', true)
            ->where('featured', true)
            ->latest()
            ->take(12)
            ->get();

        $stocks = $this->preloadStocks($products);

        return $products->map(fn ($p) => $this->formatProduct($p, $stocks))->toArray();
    }

    private function getNewArrivals(int $limit = 12): array
    {
        // New arrivals = most recently created active products.
        // Intentionally separate from featured_products (which are curated picks).
        // $limit is passed from the caller so it can be overridden without touching this method.
        $products = Product::with(['category:id,name,slug', 'variants'])
            ->where('status', true)
            ->latest()           // ORDER BY created_at DESC
            ->take($limit)
            ->get();

        $stocks = $this->preloadStocks($products);

        return $products->map(fn ($p) => $this->formatProduct($p, $stocks))->toArray();
    }

    private function getVideoProducts(): array
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

        return $products
            ->map(fn ($p) => array_merge($this->formatProduct($p, $stocks), ['video' => $p->video]))
            ->toArray();
    }

    private function getReviewsData(): array
    {
        return ProductReview::with(['product:id,name,slug,thumbnail'])
            ->where('status', true)
            ->where('show_on_homepage', true)
            ->latest()
            ->take(12)
            ->get()
            ->map(fn ($r) => [
                'id'            => $r->id,
                'customer_name' => $r->customer_name,
                'rating'        => $r->rating,
                'comment'       => $r->comment,
                'product'       => $r->product ? [
                    'id'        => $r->product->id,
                    'name'      => $r->product->name,
                    'slug'      => $r->product->slug,
                    'thumbnail' => $r->product->thumbnail
                        ? asset('storage/' . $r->product->thumbnail)
                        : null,
                ] : null,
                'created_at' => $r->created_at,
            ])
            ->toArray();
    }

    private function getBlogs(): array
    {
        return Blog::with('category:id,name,slug')
            ->where('status', 'published')
            ->latest()
            ->take(4)
            ->get(['id', 'title', 'slug', 'excerpt', 'thumbnail', 'created_at', 'blog_category_id'])
            ->map(fn ($b) => [
                'id'        => $b->id,
                'title'     => $b->title,
                'slug'      => $b->slug,
                'excerpt'   => $b->excerpt,
                'thumbnail' => $b->thumbnail ? asset('storage/' . $b->thumbnail) : null,
                'category'  => $b->category ? [
                    'id'   => $b->category->id,
                    'name' => $b->category->name,
                    'slug' => $b->category->slug,
                ] : null,
                'created_at' => $b->created_at,
            ])
            ->toArray();
    }

    // ── Stock pre-loader ─────────────────────────────────────────
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

    private function formatProduct(Product $p, ?\Illuminate\Support\Collection $stocks = null): array
    {
        // Lazy fallback for single-product calls (should rarely happen in this controller)
        if ($stocks === null) {
            $stocks = $this->preloadStocks(collect([$p]));
        }

        // Gallery: cast to array (already cast on model), then prefix storage path on each image.
        $gallery = collect($p->gallery ?? [])
            ->map(fn ($img) => asset('storage/' . $img))
            ->values()
            ->toArray();

        return [
            'id'            => $p->id,
            'name'          => $p->name,
            'urdu_name'     => $p->urdu_name,
            'slug'          => $p->slug,
            'sku'           => $p->sku,
            'price'         => (float) $p->price,
            'sale_price'    => $p->sale_price ? (float) $p->sale_price : null,
            'unit'          => $p->unit,
            'featured'      => (bool) $p->featured,
            'thumbnail'     => $p->thumbnail ? asset('storage/' . $p->thumbnail) : null,
            'gallery'       => $gallery,
            'description'   => $p->short_description ?? $p->long_description ?? null,
            'rating'        => 4.5,   // Default — live per-product average not yet aggregated
            'reviews_count' => 0,     // Default — use /products/{slug}/reviews for live counts
            'category'      => $p->category ? [
                'id'   => $p->category->id,
                'name' => $p->category->name,
                'slug' => $p->category->slug,
            ] : null,
            'variants'      => $p->variants->map(fn ($v) => [
                'id'         => $v->id,
                'name'       => collect($v->attributes ?? [])->values()->join(' / ') ?: $v->value,
                'sku'        => $v->sku,
                'price'      => (float) ($v->sale_price ?? $v->price ?? $p->price),
                'stock'      => (int) ($stocks->get($p->id . '_' . $v->id)?->first()?->quantity ?? 0),
                'is_default' => (bool) $v->is_default,
            ])->toArray(),
        ];
    }
}

