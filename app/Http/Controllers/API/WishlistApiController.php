<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\WishlistRepository;
use App\Models\ProductStock;
use App\Models\ProductVariant;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WishlistApiController extends Controller
{
    public function __construct(protected WishlistRepository $wishlistRepo) {}

    // GET /api/wishlist
    public function index(Request $request)
    {
        $items = Wishlist::with([
                'product:id,name,slug,thumbnail,price,sale_price',
                'variant:id,sku,value,attributes,price,sale_price,product_id',
            ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        // Pre-load stock for all variant IDs in one query — same pattern as ProductApiController
        $variantIds = $items->pluck('product_variant_id')->filter()->unique();
        $stocks = $variantIds->isNotEmpty()
            ? ProductStock::whereIn('product_variant_id', $variantIds)
                ->get()
                ->keyBy('product_variant_id')
            : collect();

        return response()->json([
            'success' => true,
            'data'    => $items->map(fn ($w) => [
                'id'                 => $w->id,
                'product_variant_id' => $w->product_variant_id, // null for variant-less items
                'product'            => $w->product ? [
                    'id'         => $w->product->id,
                    'name'       => $w->product->name,
                    'slug'       => $w->product->slug,
                    'price'      => (float) $w->product->price,
                    'sale_price' => $w->product->sale_price ? (float) $w->product->sale_price : null,
                    'thumbnail'  => $w->product->thumbnail ? asset('storage/' . $w->product->thumbnail) : null,
                ] : null,
                // Variant shape matches ProductApiController::formatProduct() exactly.
                // null when product has no variants or user wishlisted without selecting one.
                'variant'            => $w->variant ? [
                    'id'         => $w->variant->id,
                    'name'       => collect($w->variant->attributes ?? [])->values()->join(' / ') ?: $w->variant->value,
                    'sku'        => $w->variant->sku,
                    'price'      => (float) ($w->variant->sale_price ?? $w->variant->price),
                    'sale_price' => $w->variant->sale_price ? (float) $w->variant->sale_price : null,
                    'stock'      => (int) ($stocks->get($w->variant->id)?->quantity ?? 0),
                ] : null,
                'created_at'         => $w->created_at,
            ]),
        ]);
    }

    // POST /api/wishlist
    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id'         => 'required|exists:products,id',
                'product_variant_id' => 'nullable|exists:product_variants,id',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        // Cross-validation: ensure the variant belongs to the given product
        if ($request->filled('product_variant_id')) {
            $variantBelongsToProduct = ProductVariant::where('id', $request->product_variant_id)
                ->where('product_id', $request->product_id)
                ->exists();

            if (! $variantBelongsToProduct) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected variant does not belong to this product.',
                    'errors'  => [
                        'product_variant_id' => ['The selected variant does not belong to this product.'],
                    ],
                ], 422);
            }
        }

        try {
            $item = $this->wishlistRepo->store([
                'user_id'            => $request->user()->id,
                'product_id'         => $request->product_id,
                'product_variant_id' => $request->product_variant_id ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Added to wishlist.',
                'data'    => ['id' => $item->id],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    // DELETE /api/wishlist/{id}
    public function destroy(Request $request, string $id)
    {
        $item = Wishlist::where('user_id', $request->user()->id)->findOrFail($id);
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Removed from wishlist.',
        ]);
    }
}
