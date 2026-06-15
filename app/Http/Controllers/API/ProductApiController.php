<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\CategoryRepository;
use App\Http\Repositories\Admin\ProductRepository;
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

        $products = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $products->map(fn ($p) => $this->formatProduct($p)),
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

        return response()->json([
            'success' => true,
            'data'    => $products->map(fn ($p) => $this->formatProduct($p)),
        ]);
    }

    // GET /api/products/{slug}
    public function show(string $slug)
    {
        $product = Product::with(['category:id,name,slug', 'variants'])
            ->where('slug', $slug)
            ->where('status', true)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $this->formatProduct($product, detailed: true),
        ]);
    }

    // GET /api/categories
    public function categories()
    {
        $categories = \App\Models\Category::where('status', true)
            ->with('children:id,name,slug,image,parent_id')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'image', 'parent_id']);

        return response()->json([
            'success' => true,
            'data'    => $categories->map(fn ($c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'slug'     => $c->slug,
                'image'    => $c->image ? asset('storage/' . $c->image) : null,
                'children' => $c->children->map(fn ($ch) => [
                    'id'    => $ch->id,
                    'name'  => $ch->name,
                    'slug'  => $ch->slug,
                    'image' => $ch->image ? asset('storage/' . $ch->image) : null,
                ]),
            ]),
        ]);
    }

    // ── Format Helper ─────────────────────────────────────────────
    private function formatProduct(Product $p, bool $detailed = false): array
    {
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
                'stock'      => (int) (ProductStock::where('product_id', $p->id)->where('product_variant_id', $v->id)->value('quantity') ?? 0),
                'is_default' => (bool) $v->is_default,
            ]),
        ];

        if ($detailed) {
            $stockRecord = ProductStock::where('product_id', $p->id)->whereNull('product_variant_id')->first();
            $base['description']  = $p->description;
            $base['excerpt']      = $p->excerpt ?? null;
            $base['gallery']      = collect($p->gallery ?? [])->map(fn ($img) => asset('storage/' . $img));
            $base['stock']        = $stockRecord ? (int) $stockRecord->quantity : (int) ($p->quantity ?? 0);
            $base['meta_title']   = $p->meta_title ?? $p->name;
            $base['meta_desc']    = $p->meta_description ?? null;
        }

        return $base;
    }
}
