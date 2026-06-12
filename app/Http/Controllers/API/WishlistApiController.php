<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\WishlistRepository;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistApiController extends Controller
{
    public function __construct(protected WishlistRepository $wishlistRepo) {}

    // GET /api/wishlist
    public function index(Request $request)
    {
        $items = Wishlist::with(['product:id,name,slug,thumbnail,price,sale_price', 'variant:id,sku,value,attributes'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $items->map(fn ($w) => [
                'id'         => $w->id,
                'product'    => $w->product ? [
                    'id'         => $w->product->id,
                    'name'       => $w->product->name,
                    'slug'       => $w->product->slug,
                    'price'      => (float) $w->product->price,
                    'sale_price' => $w->product->sale_price ? (float) $w->product->sale_price : null,
                    'thumbnail'  => $w->product->thumbnail ? asset('storage/' . $w->product->thumbnail) : null,
                ] : null,
                'variant'    => $w->variant ? [
                    'id'   => $w->variant->id,
                    'name' => collect($w->variant->attributes ?? [])->values()->join(' / ') ?: $w->variant->value,
                    'sku'  => $w->variant->sku,
                ] : null,
                'created_at' => $w->created_at,
            ]),
        ]);
    }

    // POST /api/wishlist
    public function store(Request $request)
    {
        $request->validate([
            'product_id'         => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
        ]);

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
