<?php

namespace App\Services;

use App\Models\City;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Validation\ValidationException;

/**
 * Prices a storefront cart on the server. Used both to place orders and to
 * quote the cart/checkout totals, so what the customer sees is what they pay.
 *
 * Money values sent by the storefront are never trusted:
 *  - items.*.price is only used to pick between a variant's base price and
 *    its final_price (base + additional); it is capped to final_price, and a
 *    price below the base is accepted only when a deal brings it that low.
 *  - Deals (DealPricingService) become per-line discounts.
 *  - The coupon discount is recomputed from coupon_code; invoice_discount is ignored.
 *  - Shipping is the city rate, free above FREE_SHIPPING_ABOVE.
 */
class CheckoutPricingService
{
    /** Default shipping when no city is chosen — must match DEFAULT_SHIPPING in the frontend (lib/cities.ts). */
    public const DEFAULT_SHIPPING = 250;

    /** Orders above this subtotal ship free — must match the checkout page rule. */
    public const FREE_SHIPPING_ABOVE = 5000;

    public function __construct(protected DealPricingService $deals) {}

    /**
     * @return array  $data with items/invoice_discount/coupon_code/shipping_charges
     *                rewritten, plus a 'breakdown' key for quotes.
     *
     * @throws ValidationException
     */
    public function price(array $data): array
    {
        $items      = array_values($data['items'] ?? []);
        $variantIds = collect($items)->pluck('product_variant_id')->filter()->unique();
        $productIds = collect($items)->pluck('product_id')->filter()->unique();

        $activeProducts = Product::whereIn('id', $productIds)->where('status', true)->pluck('id')->flip();
        $variants = ProductVariant::whereIn('id', $variantIds)->where('status', true)->get()->keyBy('id');
        $fallback = ProductVariant::whereIn('product_id', $productIds)->where('status', true)->get()->groupBy('product_id');

        // ── 1. Catalogue price per line ──────────────────────────────
        $sentBelowBase = [];
        foreach ($items as $i => $item) {
            if (! $activeProducts->has($item['product_id'])) {
                throw ValidationException::withMessages(["items.$i.product_id" => ['This product is currently unavailable.']]);
            }

            $variant = null;
            if (! empty($item['product_variant_id'])) {
                $variant = $variants->get($item['product_variant_id']);
                if (! $variant) {
                    throw ValidationException::withMessages(["items.$i.product_variant_id" => ['This option is currently unavailable.']]);
                }
                if ((int) $variant->product_id !== (int) $item['product_id']) {
                    throw ValidationException::withMessages(["items.$i.product_variant_id" => ['Selected option does not belong to this product.']]);
                }
            }

            // No variant sent: accept the cheapest variant of the product as the floor.
            $candidates = $variant ? collect([$variant]) : ($fallback->get($item['product_id']) ?? collect());
            if ($candidates->isEmpty()) {
                throw ValidationException::withMessages(["items.$i.product_id" => ['This product is currently unavailable.']]);
            }

            $base  = (float) $candidates->min(fn ($v) => $v->sale_price ?? $v->price ?? 0);
            $final = (float) $candidates->max(fn ($v) => ($v->sale_price ?? $v->price ?? 0) + (int) ($v->additional ?? 0));
            $price = (float) ($item['price'] ?? $final);

            if ($base <= 0) {
                throw ValidationException::withMessages(["items.$i.product_id" => ['This product is currently unavailable.']]);
            }

            $sentBelowBase[$i] = $price < $base - 0.5 ? $price : null;
            $items[$i]['price']    = $price < $base - 0.5 ? $base : min($price, $final);
            $items[$i]['quantity'] = (int) $item['quantity'];
        }

        // ── 2. Deals ─────────────────────────────────────────────────
        $dealLines = $this->deals->applyToLines(array_map(fn ($it) => [
            'product_id' => (int) $it['product_id'],
            'price'      => (float) $it['price'],
            'quantity'   => (int) $it['quantity'],
        ], $items));

        $subtotal = 0.0;
        $lines    = [];
        foreach ($items as $i => $item) {
            $deal      = $dealLines[$i];
            $qty       = (int) $item['quantity'];
            $gross     = round($item['price'] * $qty, 2);
            $effective = ($gross - $deal['discount']) / $qty;

            // A price below the catalogue price is only fine when a deal explains it
            if ($sentBelowBase[$i] !== null && $sentBelowBase[$i] < $effective - 0.5) {
                throw ValidationException::withMessages(["items.$i.price" => ['The price of an item in your cart has changed. Please refresh your cart and try again.']]);
            }

            $items[$i]['discount']   = $deal['discount'];
            $items[$i]['deal_id']    = $deal['deal_id'];
            $items[$i]['deal_units'] = $deal['units'];
            $items[$i]['deal_title'] = $deal['deal_title'];

            $lineTotal = $gross - $deal['discount'];
            $subtotal += $lineTotal;
            $lines[]   = ['product_id' => (int) $item['product_id'], 'total' => $lineTotal];
        }
        $data['items'] = $items;

        // ── 3. Coupon ────────────────────────────────────────────────
        $discount = 0.0;
        $code = trim((string) ($data['coupon_code'] ?? ''));
        $data['coupon_code'] = null;
        if ($code !== '') {
            $coupon   = Coupon::where('code', strtoupper($code))->first();
            $eligible = $coupon ? $coupon->eligibleAmount($lines) : 0;
            if (! $coupon || ! $coupon->isValid() || $eligible <= 0
                || ($coupon->min_purchase_amount && $subtotal < $coupon->min_purchase_amount)) {
                throw ValidationException::withMessages(['coupon_code' => ['This coupon is no longer valid. Please remove it and try again.']]);
            }
            $discount = round(min((float) $coupon->calculateDiscount($eligible), $eligible), 2);
            $data['coupon_code'] = $coupon->code;
        }
        $data['invoice_discount'] = $discount;

        // ── 4. Shipping ──────────────────────────────────────────────
        $cityRate = ! empty($data['city_id'])
            ? City::whereKey($data['city_id'])->value('shipping_charges')
            : null;
        $data['shipping_charges'] = $subtotal > self::FREE_SHIPPING_ABOVE
            ? 0
            : (float) ($cityRate ?? self::DEFAULT_SHIPPING);

        $data['breakdown'] = [
            'items' => collect($items)->map(fn ($it) => [
                'product_id'         => (int) $it['product_id'],
                'product_variant_id' => $it['product_variant_id'] ?? null,
                'quantity'           => (int) $it['quantity'],
                'unit_price'         => (float) $it['price'],
                'deal_discount'      => (float) $it['discount'],
                'line_total'         => round($it['price'] * $it['quantity'] - $it['discount'], 2),
                'deal'               => $it['deal_id'] ? ['id' => $it['deal_id'], 'title' => $it['deal_title']] : null,
            ])->values()->all(),
            'subtotal'         => round(collect($items)->sum(fn ($it) => $it['price'] * $it['quantity']), 2),
            'deal_discount'    => round(collect($items)->sum('discount'), 2),
            'coupon_code'      => $data['coupon_code'],
            'coupon_discount'  => $discount,
            'shipping'         => (float) $data['shipping_charges'],
            'grand_total'      => round($subtotal - $discount + $data['shipping_charges'], 2),
        ];

        return $data;
    }
}
