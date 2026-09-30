<?php

namespace App\Services;

use App\Models\Deal;
use Illuminate\Support\Collection;

/**
 * Single source of truth for how admin "Deals" change a price.
 *
 * Deal types:
 *  - percentage / flash_sale : % off each unit   (pivot custom_discount ?? discount_value)
 *  - fixed                   : Rs off each unit  (pivot custom_discount ?? discount_value)
 *  - buy_x_get_y             : for every (X + Y) units on a line, Y units are free
 *  - bundle                  : % off every deal product, only when ALL of the deal's
 *                              products are in the cart
 *
 * Limits honoured: active window, is_active, max_uses (total orders),
 * min_purchase_amount (cart subtotal), pivot stock_limit - sold_count (units).
 * max_uses_per_user is checked when the order is saved (OrderRepository),
 * because it needs the customer.
 */
class DealPricingService
{
    /** Active, not-exhausted deals keyed by product id → Collection<Deal> (with pivot). */
    public function activeDealsFor(iterable $productIds): Collection
    {
        $ids = collect($productIds)->filter()->unique()->values();
        if ($ids->isEmpty()) {
            return collect();
        }

        $deals = Deal::active()
            ->where(fn ($q) => $q->whereNull('max_uses')->orWhereColumn('current_uses', '<', 'max_uses'))
            ->whereHas('products', fn ($q) => $q->whereIn('products.id', $ids))
            ->with('products')
            ->orderBy('display_order')
            ->get();

        $byProduct = collect();
        foreach ($deals as $deal) {
            foreach ($deal->products as $product) {
                if ($ids->contains($product->id)) {
                    $byProduct[$product->id] = ($byProduct[$product->id] ?? collect())->push($deal);
                }
            }
        }

        return $byProduct;
    }

    /** Percentage or rupee value this deal gives for one product. */
    public function valueFor(Deal $deal, int $productId): float
    {
        $pivot = $deal->products->firstWhere('id', $productId)?->pivot;

        return (float) ($pivot?->custom_discount ?? $deal->discount_value ?? 0);
    }

    /** Units of this product still available at the deal price (null = unlimited). */
    public function remainingUnits(Deal $deal, int $productId): ?int
    {
        $pivot = $deal->products->firstWhere('id', $productId)?->pivot;
        if (! $pivot || $pivot->stock_limit === null) {
            return null;
        }

        return max(0, (int) $pivot->stock_limit - (int) $pivot->sold_count);
    }

    /** Discount on ONE unit for per-unit deal types (0 for buy_x_get_y / bundle). */
    public function unitDiscount(Deal $deal, int $productId, float $unitPrice): float
    {
        $value = $this->valueFor($deal, $productId);

        return match ($deal->deal_type) {
            'percentage', 'flash_sale' => round($unitPrice * min($value, 100) / 100, 2),
            'fixed'                    => round(min($value, $unitPrice), 2),
            default                    => 0.0,
        };
    }

    /** Price shown on product cards/pages for a variant, or null when no per-unit deal applies. */
    public function displayPrice(?Deal $deal, int $productId, float $unitPrice): ?float
    {
        if (! $deal || ! in_array($deal->deal_type, ['percentage', 'flash_sale', 'fixed'], true)) {
            return null;
        }
        if ($this->remainingUnits($deal, $productId) === 0) {
            return null;
        }

        $discount = $this->unitDiscount($deal, $productId, $unitPrice);

        return $discount > 0 ? round($unitPrice - $discount, 2) : null;
    }

    /** Best per-unit deal for a product at a given price (used for display). */
    public function bestDisplayDeal(Collection $dealsForProduct, int $productId, float $unitPrice): ?Deal
    {
        return $dealsForProduct
            ->filter(fn (Deal $d) => $this->displayPrice($d, $productId, $unitPrice) !== null
                || in_array($d->deal_type, ['buy_x_get_y', 'bundle'], true))
            ->sortByDesc(fn (Deal $d) => $this->unitDiscount($d, $productId, $unitPrice))
            ->first();
    }

    /**
     * Add deal fields to a product formatted by the product/homepage APIs:
     * product 'deal' + 'deal_price', and 'deal_price' on each variant
     * (computed from its final_price). Existing fields are left untouched.
     */
    public function decorate(array $product, ?Collection $deals): array
    {
        $product['deal']       = null;
        $product['deal_price'] = null;

        $productId = (int) $product['id'];
        $deals     = $deals ?? collect();
        $best      = null;
        $bestSaving = -1.0;

        $product['variants'] = collect($product['variants'] ?? [])->map(function ($v) use ($deals, $productId, &$best, &$bestSaving) {
            $v    = (array) $v;
            $unit = (float) ($v['final_price'] ?? $v['price'] ?? 0);
            $deal = $deals->isNotEmpty() ? $this->bestDisplayDeal($deals, $productId, $unit) : null;

            $v['deal_price'] = $this->displayPrice($deal, $productId, $unit);

            if ($deal) {
                $saving = $v['deal_price'] !== null ? $unit - $v['deal_price'] : 0.0;
                if ($saving > $bestSaving) {
                    $best = $deal;
                    $bestSaving = $saving;
                }
            }

            return $v;
        })->values()->all();

        if ($best) {
            $product['deal'] = $this->summary($best, $productId);
            $prices = collect($product['variants'])->pluck('deal_price')->filter(fn ($p) => $p !== null);
            $product['deal_price'] = $prices->isNotEmpty() ? (float) $prices->min() : null;
        }

        return $product;
    }

    /** Public shape of a deal for API responses. */
    public function summary(Deal $deal, ?int $productId = null): array
    {
        return [
            'id'                  => $deal->id,
            'title'               => $deal->title,
            'slug'                => $deal->slug,
            'type'                => $deal->deal_type,
            'value'               => $productId ? $this->valueFor($deal, $productId) : (float) ($deal->discount_value ?? 0),
            'min_quantity'        => (int) $deal->min_quantity,
            'free_quantity'       => (int) $deal->free_quantity,
            'min_purchase_amount' => $deal->min_purchase_amount !== null ? (float) $deal->min_purchase_amount : null,
            'badge_text'          => $deal->badge_text ?: $this->defaultBadge($deal, $productId),
            'badge_color'         => $deal->badge_color,
            'ends_at'             => $deal->ends_at?->toIso8601String(),
        ];
    }

    public function defaultBadge(Deal $deal, ?int $productId = null): string
    {
        $value = $productId ? $this->valueFor($deal, $productId) : (float) ($deal->discount_value ?? 0);

        return match ($deal->deal_type) {
            'percentage', 'flash_sale', 'bundle' => rtrim(rtrim(number_format($value, 2), '0'), '.') . '% OFF',
            'fixed'       => 'PKR ' . number_format($value) . ' OFF',
            'buy_x_get_y' => 'Buy ' . $deal->min_quantity . ' Get ' . $deal->free_quantity . ' Free',
            default       => 'DEAL',
        };
    }

    /**
     * Apply deals to priced cart lines.
     *
     * @param  array<int, array{product_id:int, price:float, quantity:int}>  $lines
     * @return array<int, array{deal_id:?int, discount:float, units:int, deal_title:?string}>  keyed like $lines
     */
    public function applyToLines(array $lines): array
    {
        $result = [];
        foreach ($lines as $i => $line) {
            $result[$i] = ['deal_id' => null, 'discount' => 0.0, 'units' => 0, 'deal_title' => null];
        }

        $dealsByProduct = $this->activeDealsFor(collect($lines)->pluck('product_id'));
        if ($dealsByProduct->isEmpty()) {
            return $result;
        }

        $cartSubtotal  = collect($lines)->sum(fn ($l) => $l['price'] * $l['quantity']);
        $cartProducts  = collect($lines)->pluck('product_id')->map(fn ($id) => (int) $id)->unique();
        $unitsLeft     = []; // "{deal}_{product}" → remaining units across lines

        foreach ($lines as $i => $line) {
            $productId = (int) $line['product_id'];
            $qty       = (int) $line['quantity'];
            $price     = (float) $line['price'];

            $best = null;
            foreach ($dealsByProduct->get($productId, collect()) as $deal) {
                if ($deal->min_purchase_amount && $cartSubtotal < (float) $deal->min_purchase_amount) {
                    continue;
                }
                if ($deal->deal_type === 'bundle'
                    && $deal->products->pluck('id')->diff($cartProducts)->isNotEmpty()) {
                    continue; // bundle needs every product in the cart
                }

                $key       = $deal->id . '_' . $productId;
                $remaining = $unitsLeft[$key] ?? $this->remainingUnits($deal, $productId);
                $units     = $remaining === null ? $qty : min($qty, $remaining);
                if ($units <= 0) {
                    continue;
                }

                $discount = match ($deal->deal_type) {
                    'buy_x_get_y' => $this->buyXGetYDiscount($deal, $price, $units),
                    'bundle'      => round($price * min($this->valueFor($deal, $productId), 100) / 100, 2) * $units,
                    default       => $this->unitDiscount($deal, $productId, $price) * $units,
                };

                if ($discount > 0 && (! $best || $discount > $best['discount'])) {
                    $best = ['deal' => $deal, 'discount' => round($discount, 2), 'units' => $units, 'key' => $key, 'remaining' => $remaining];
                }
            }

            if ($best) {
                if ($best['remaining'] !== null) {
                    $unitsLeft[$best['key']] = $best['remaining'] - $best['units'];
                }
                $result[$i] = [
                    'deal_id'    => $best['deal']->id,
                    'discount'   => min($best['discount'], round($price * $qty, 2)),
                    'units'      => $best['units'],
                    'deal_title' => $best['deal']->title,
                ];
            }
        }

        return $result;
    }

    private function buyXGetYDiscount(Deal $deal, float $unitPrice, int $units): float
    {
        $buy  = max(1, (int) $deal->min_quantity);
        $free = max(0, (int) $deal->free_quantity);
        if ($free === 0) {
            return 0.0;
        }

        $freeUnits = intdiv($units, $buy + $free) * $free;

        return round($freeUnits * $unitPrice, 2);
    }
}
