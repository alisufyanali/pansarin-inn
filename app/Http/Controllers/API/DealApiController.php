<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Product;
use App\Models\ProductStock;
use App\Services\DealPricingService;
use Illuminate\Http\Request;

class DealApiController extends Controller
{
    public const TYPES = ['percentage', 'fixed', 'buy_x_get_y', 'bundle', 'flash_sale'];

    public function __construct(protected DealPricingService $pricing) {}

    // GET /api/deals — active deals (admin → Product Deals), featured first
    // ?featured=1 → featured only, ?type=bundle → one deal type only
    public function index(Request $request)
    {
        $type = in_array($request->get('type'), self::TYPES, true) ? $request->get('type') : null;

        return response()->json([
            'success' => true,
            'data'    => $this->listing($type, $request->boolean('featured')),
        ]);
    }

    /**
     * Active deals in the storefront shape. Also feeds the homepage
     * "Combo Deals" section (HomepageApiController, bundle deals first).
     */
    public function listing(?string $type = null, bool $featuredOnly = false, int $limit = 50, bool $bundlesFirst = false): array
    {
        $deals = $this->activeQuery()
            ->when($type, fn ($q) => $q->where('deal_type', $type))
            ->when($featuredOnly, fn ($q) => $q->where('is_featured', true))
            ->when($bundlesFirst, fn ($q) => $q->orderByRaw("CASE WHEN deal_type = 'bundle' THEN 0 ELSE 1 END"))
            ->orderByDesc('is_featured')
            ->orderBy('display_order')
            ->latest('id')
            ->limit($limit)
            ->get();

        $stocks = $this->stocksFor($deals->flatMap->products);

        return $deals->map(fn (Deal $d) => $this->format($d, $stocks))->values()->all();
    }

    // GET /api/deals/{slug}
    public function show(string $slug)
    {
        $deal   = $this->activeQuery()->where('slug', $slug)->firstOrFail();
        $stocks = $this->stocksFor($deal->products);

        return response()->json([
            'success' => true,
            'data'    => $this->format($deal, $stocks),
        ]);
    }

    private function activeQuery()
    {
        return Deal::active()
            ->where(fn ($q) => $q->whereNull('max_uses')->orWhereColumn('current_uses', '<', 'max_uses'))
            // A deal with no (active) products has nothing to show
            ->whereHas('products', fn ($q) => $q->where('status', true))
            ->with(['products' => fn ($q) => $q->where('status', true)->with(['variants' => fn ($v) => $v->where('status', true), 'category:id,name,slug'])]);
    }

    private function stocksFor($products)
    {
        $ids = collect($products)->pluck('id')->unique();

        return ProductStock::whereIn('product_id', $ids)->whereNotNull('product_variant_id')
            ->get()->keyBy('product_variant_id');
    }

    private function format(Deal $deal, $stocks): array
    {
        $deals = collect([$deal]);

        return array_merge($this->pricing->summary($deal), [
            'description'  => $deal->description,
            'image'        => $deal->image ? asset('storage/' . $deal->image) : null,
            'is_featured'  => (bool) $deal->is_featured,
            'starts_at'    => $deal->starts_at?->toIso8601String(),
            'products'     => $deal->products->map(function (Product $p) use ($deals, $stocks, $deal) {
                $product = $this->pricing->decorate([
                    'id'        => $p->id,
                    'name'      => $p->name,
                    'urdu_name' => $p->urdu_name,
                    'slug'      => $p->slug,
                    'unit'      => $p->unit,
                    'thumbnail' => $p->thumbnail ? asset('storage/' . $p->thumbnail) : null,
                    'category'  => $p->category ? ['id' => $p->category->id, 'name' => $p->category->name, 'slug' => $p->category->slug] : null,
                    'price'     => $p->variants->isNotEmpty()
                        ? (float) $p->variants->min(fn ($v) => ($v->sale_price ?? $v->price) + ($v->additional ?? 0))
                        : 0.0,
                    'variants'  => $p->variants->map(fn ($v) => [
                        'id'          => $v->id,
                        'name'        => collect($v->attributes ?? [])->values()->join(' / ') ?: $v->value,
                        'price'       => (float) ($v->sale_price ?? $v->price ?? 0),
                        'additional'  => (int) ($v->additional ?? 0),
                        'final_price' => (float) ($v->sale_price ?? $v->price ?? 0) + (int) ($v->additional ?? 0),
                        'stock'       => (int) ($stocks->get($v->id)?->quantity ?? 0),
                        'is_default'  => (bool) $v->is_default,
                    ])->values()->all(),
                ], $deals);

                $product['deal_units_left'] = $this->pricing->remainingUnits($deal, $p->id);

                return $product;
            })->values(),
        ]);
    }
}
