<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\ProductStock;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class CartApiController extends Controller
{
    // GET /api/cart
    public function index(Request $request)
    {
        $items = Cart::with([
            'variant.product:id,name,slug,thumbnail,unit',
        ])->where('user_id', $request->user()->id)->get();

        // Batch-load stock for all variants in one query — avoids N+1
        $variantIds = $items->pluck('product_variant_id')->filter()->unique();
        $stocks = ProductStock::whereIn('product_variant_id', $variantIds)
            ->get(['product_variant_id', 'quantity'])
            ->keyBy('product_variant_id');

        return response()->json([
            'success' => true,
            'data'    => $items->map(fn ($c) => $this->formatCartItem($c, $stocks)),
        ]);
    }

    // POST /api/cart
    public function store(Request $request)
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity'           => 'required|integer|min:1',
        ]);

        $userId    = $request->user()->id;
        $variantId = $request->product_variant_id;
        $variant   = ProductVariant::with('product')->findOrFail($variantId);

        // Stock check — use cumulative quantity (existing cart qty + new qty)
        // so multiple add-to-cart calls on the same variant can't bypass the limit.
        $stock = ProductStock::where('product_id', $variant->product_id)
            ->where('product_variant_id', $variantId)
            ->value('quantity') ?? 0;

        $existingQty = Cart::where('user_id', $userId)
            ->where('product_variant_id', $variantId)
            ->value('quantity') ?? 0;

        $totalQty = $existingQty + $request->quantity;

        if ($totalQty > $stock) {
            $remaining = max(0, $stock - $existingQty);

            if ($existingQty > 0) {
                $message = $remaining > 0
                    ? "Only {$remaining} more available (you already have {$existingQty} in cart)."
                    : "You already have {$existingQty} in cart and no more are available.";
            } else {
                $message = "Only {$stock} units available in stock.";
            }

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 422);
        }

        // Upsert — agar same variant already cart mein hai to quantity add karo
        $cartItem = Cart::where('user_id', $userId)
            ->where('product_variant_id', $variantId)
            ->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $request->quantity);
        } else {
            $cartItem = Cart::create([
                'user_id'            => $userId,
                'product_variant_id' => $variantId,
                'quantity'           => $request->quantity,
            ]);
        }

        $cartItem->load('variant.product:id,name,slug,thumbnail,unit');

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart.',
            'data'    => $this->formatCartItem($cartItem),
        ], 201);
    }

    // PATCH /api/cart/{id}
    public function update(Request $request, string $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = Cart::where('user_id', $request->user()->id)->findOrFail($id);

        // Stock check
        $stock = ProductStock::where('product_variant_id', $cartItem->product_variant_id)
            ->value('quantity') ?? 0;

        if ($request->quantity > $stock) {
            return response()->json([
                'success' => false,
                'message' => "Only {$stock} units available in stock.",
            ], 422);
        }

        $cartItem->update(['quantity' => $request->quantity]);
        $cartItem->load('variant.product:id,name,slug,thumbnail,unit');

        return response()->json([
            'success' => true,
            'message' => 'Cart updated.',
            'data'    => $this->formatCartItem($cartItem),
        ]);
    }

    // DELETE /api/cart/{id}
    public function destroy(Request $request, string $id)
    {
        Cart::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart.',
        ]);
    }

    // DELETE /api/cart  (clear entire cart)
    public function clear(Request $request)
    {
        Cart::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared.',
        ]);
    }

    // ── Format Helper ─────────────────────────────────────────────
    // $stocks: preloaded collection keyed by product_variant_id (from index()).
    //          Pass null for single-item responses (store/update) — falls back
    //          to a live single-row query so the caller always gets stock data.
    private function formatCartItem(Cart $c, ?\Illuminate\Support\Collection $stocks = null): array
    {
        $variant   = $c->variant;
        $product   = $variant?->product;
        $unitPrice = (float) ($variant?->sale_price ?? $variant?->price ?? 0);

        // Resolve stock — use preloaded collection when available, otherwise query live
        if ($stocks !== null) {
            $qty = (int) ($stocks->get($c->product_variant_id)?->quantity ?? 0);
        } else {
            $qty = (int) (ProductStock::where('product_variant_id', $c->product_variant_id)
                ->value('quantity') ?? 0);
        }

        // Deal shown on the cart line (display only — /api/checkout/quote has the real totals)
        $dealPricing = app(\App\Services\DealPricingService::class);
        $deals       = $product ? $dealPricing->activeDealsFor([$product->id])->get($product->id) : null;
        $deal        = $deals ? $dealPricing->bestDisplayDeal($deals, $product->id, $unitPrice) : null;

        return [
            'id'         => $c->id,
            'quantity'   => $c->quantity,
            'unit_price' => $unitPrice,
            'deal_price' => $deal ? $dealPricing->displayPrice($deal, $product->id, $unitPrice) : null,
            'deal'       => $deal ? $dealPricing->summary($deal, $product->id) : null,
            'subtotal'   => round($unitPrice * $c->quantity, 2),
            'stock'      => $qty,
            'in_stock'   => $qty > 0,
            'product'    => $product ? [
                'id'        => $product->id,
                'name'      => $product->name,
                'slug'      => $product->slug,
                'thumbnail' => $product->thumbnail ? asset('storage/' . $product->thumbnail) : null,
            ] : null,
            'variant'    => $variant ? [
                'id'   => $variant->id,
                // e.g. "250 gm / Powder" — same label the product page puts on guest cart items
                'name' => $variant->label($product?->unit),
                'sku'  => $variant->sku,
            ] : null,
        ];
    }
}
