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
            'variant.product:id,name,slug,thumbnail,price,sale_price',
        ])->where('user_id', $request->user()->id)->get();

        return response()->json([
            'success' => true,
            'data'    => $items->map(fn ($c) => $this->formatCartItem($c)),
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

        // Stock check
        $stock = ProductStock::where('product_id', $variant->product_id)
            ->where('product_variant_id', $variantId)
            ->value('quantity') ?? 0;

        if ($request->quantity > $stock) {
            return response()->json([
                'success' => false,
                'message' => "Only {$stock} units available in stock.",
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

        $cartItem->load('variant.product:id,name,slug,thumbnail,price,sale_price');

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
        $cartItem->load('variant.product:id,name,slug,thumbnail,price,sale_price');

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
    private function formatCartItem(Cart $c): array
    {
        $variant   = $c->variant;
        $product   = $variant?->product;
        $unitPrice = (float) ($variant?->sale_price ?? $variant?->price ?? $product?->sale_price ?? $product?->price ?? 0);

        return [
            'id'         => $c->id,
            'quantity'   => $c->quantity,
            'unit_price' => $unitPrice,
            'subtotal'   => round($unitPrice * $c->quantity, 2),
            'product'    => $product ? [
                'id'        => $product->id,
                'name'      => $product->name,
                'slug'      => $product->slug,
                'thumbnail' => $product->thumbnail ? asset('storage/' . $product->thumbnail) : null,
            ] : null,
            'variant'    => $variant ? [
                'id'   => $variant->id,
                'name' => collect($variant->attributes ?? [])->values()->join(' / ') ?: $variant->value,
                'sku'  => $variant->sku,
            ] : null,
        ];
    }
}
