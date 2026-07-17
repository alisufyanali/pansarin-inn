<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductReviewApiController extends Controller
{
    /**
     * GET /api/products/{slug}/reviews
     *
     * Returns approved, publicly visible reviews for a product.
     * Public endpoint — no auth required.
     */
    public function index(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->where('status', true)->firstOrFail();

        $reviews = ProductReview::where('product_id', $product->id)
            ->where('status', true)          // admin-approved only
            ->latest()
            ->paginate($request->get('per_page', 10));

        // Aggregate rating stats in one query
        $stats = ProductReview::where('product_id', $product->id)
            ->where('status', true)
            ->selectRaw('COUNT(*) as total, AVG(rating) as average, 
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star')
            ->first();

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total'      => (int) $stats->total,
                    'average'    => $stats->total > 0 ? round((float) $stats->average, 1) : 0,
                    'breakdown'  => [
                        5 => (int) $stats->five_star,
                        4 => (int) $stats->four_star,
                        3 => (int) $stats->three_star,
                        2 => (int) $stats->two_star,
                        1 => (int) $stats->one_star,
                    ],
                ],
                'reviews' => $reviews->map(fn ($r) => [
                    'id'            => $r->id,
                    'customer_name' => $r->customer_name,
                    'rating'        => (int) $r->rating,
                    'comment'       => $r->comment,
                    'is_verified'   => (bool) $r->is_verified,
                    'created_at'    => $r->created_at->toDateString(),
                ]),
            ],
            'meta' => [
                'total'        => $reviews->total(),
                'per_page'     => $reviews->perPage(),
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/products/{slug}/reviews
     *
     * Submit a product review.
     * Auth required. One review per user per product.
     * If the user provides an order_number, purchase is verified automatically.
     * Reviews go into pending (status=false) until admin approves.
     */
    public function store(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->where('status', true)->firstOrFail();

        try {
            $validated = $request->validate([
                'rating'       => 'required|integer|min:1|max:5',
                'comment'      => 'required|string|min:10|max:2000',
                'order_number' => 'nullable|string|max:100',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        $user     = $request->user();
        $customer = $user->customer;

        // Block duplicate review — one per user per product
        $alreadyReviewed = ProductReview::where('product_id', $product->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted a review for this product.',
            ], 422);
        }

        // Verify purchase if order_number provided
        $isVerified = false;
        if (! empty($validated['order_number']) && $customer) {
            $isVerified = Order::where('order_number', $validated['order_number'])
                ->where('customer_id', $customer->id)
                ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
                ->exists();
        }

        $review = ProductReview::create([
            'product_id'     => $product->id,
            'user_id'        => $user->id,
            'customer_name'  => $customer ? $customer->full_name : $user->name,
            'customer_email' => $user->email,
            'order_number'   => $validated['order_number'] ?? null,
            'rating'         => $validated['rating'],
            'comment'        => $validated['comment'],
            'is_verified'    => $isVerified,
            'status'         => false, // Pending admin approval
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your review! It will appear after admin approval.',
            'data'    => [
                'id'          => $review->id,
                'rating'      => $review->rating,
                'comment'     => $review->comment,
                'is_verified' => $review->is_verified,
                'status'      => 'pending_approval',
            ],
        ], 201);
    }
}
