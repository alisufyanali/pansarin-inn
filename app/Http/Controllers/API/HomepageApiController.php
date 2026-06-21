<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;

class HomepageApiController extends Controller
{
    // GET /api/homepage/reviews
    public function reviews()
    {
        // status = true (approved), show_on_homepage = true
        $reviews = ProductReview::with(['product:id,name,slug,thumbnail'])
            ->where('status', true)
            ->where('show_on_homepage', true)
            ->latest()
            ->take(12)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $reviews->map(fn ($r) => [
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
                'created_at'    => $r->created_at,
            ]),
        ]);
    }
}
