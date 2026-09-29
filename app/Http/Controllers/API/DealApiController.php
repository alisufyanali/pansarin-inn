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
    public function __construct(protected DealPricingService $pricing) {}

    // GET /api/deals — active deals (admin → Product Deals), featured first
    public function index(Request $request)
    {
        $deals = $this->activeQuery()
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->orderByDesc('is_featured')
            ->orderBy('display_order')
            ->latest('id')
            ->limit(50)
            ->get();

        $stocks = $this->stocksFor($deals->flatMap->products);

        return response()->json([
            'success' => true,
            'data'    => $deals->map(fn (Deal $d) => $this->format($d, $stocks))->values(),
        ]);
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
