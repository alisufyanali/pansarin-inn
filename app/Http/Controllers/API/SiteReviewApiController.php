<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\SiteReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SiteReviewApiController extends Controller
{
    /**
     * GET /api/reviews
     *
     * Public — returns only approved site-wide reviews.
     * Supports: per_page, sort (newest|oldest|highest_rating|lowest_rating), search (reviewer name).
     */
    public function index(Request $request)
    {
        $query = SiteReview::approved();

        // Search by reviewer name
        if ($request->filled('search')) {
            $query->where('reviewer_name', 'like', '%' . $request->search . '%');
        }

        // Sort
        match ($request->get('sort', 'newest')) {
            'oldest'         => $query->oldest(),
            'highest_rating' => $query->orderByDesc('rating')->latest(),
            'lowest_rating'  => $query->orderBy('rating')->latest(),
            default          => $query->latest(), // 'newest'
        };

        $reviews = $query->paginate(min((int) $request->get('per_page', 12), 50));

        return response()->json([
            'success' => true,
            'data'    => $reviews->map(fn ($r) => $this->formatPublic($r)),
            'meta'    => [
                'total'        => $reviews->total(),
                'per_page'     => $reviews->perPage(),
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/reviews
     *
     * Public — submit a site-wide review.
     * Requires a valid order_number and matching email.
     * One review per order (enforced at DB + application level).
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'reviewer_name'  => 'required|string|max:255',
                'reviewer_email' => 'required|email|max:255',
                'order_number'   => 'required|string|max:100',
                'rating'         => 'required|integer|min:1|max:5',
                'comment'        => 'required|string|min:10|max:2000',
                'image'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        // ── 1. Verify order exists ────────────────────────────────
        $order = Order::where('order_number', $validated['order_number'])->first();

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'No order found with this order number.',
            ], 422);
        }

        // ── 2. Verify email matches the order's customer ──────────
        $customerEmailMatches = Customer::where('id', $order->customer_id)
            ->where('email', $validated['reviewer_email'])
            ->exists();

        if (! $customerEmailMatches) {
            return response()->json([
                'success' => false,
                'message' => 'The email address does not match the order records.',
            ], 422);
        }

        // ── 3. Check for duplicate review on this order ───────────
        $alreadyReviewed = SiteReview::where('order_id', $order->id)->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'success' => false,
                'message' => 'A review has already been submitted for this order.',
            ], 422);
        }

        // ── 4. Handle optional image upload ───────────────────────
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('site-reviews', 'public');
        }

        // ── 5. Create review (pending — requires admin approval) ──
        $review = SiteReview::create([
            'order_id'       => $order->id,
            'order_number'   => $order->order_number,
            'reviewer_name'  => $validated['reviewer_name'],
            'reviewer_email' => $validated['reviewer_email'],
            'rating'         => $validated['rating'],
            'comment'        => $validated['comment'],
            'image'          => $imagePath,
            'status'         => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your review! It will appear after admin approval.',
            'data'    => [
                'id'     => $review->id,
                'status' => 'pending_approval',
            ],
        ], 201);
    }

    // ── Private formatter ─────────────────────────────────────────

    private function formatPublic(SiteReview $r): array
    {
        return [
            'id'            => $r->id,
            'reviewer_name' => $r->reviewer_name,
            'rating'        => $r->rating,
            'comment'       => $r->comment,
            'image'         => $r->image ? asset('storage/' . $r->image) : null,
            'created_at'    => $r->created_at->toDateString(),
        ];
    }
}
