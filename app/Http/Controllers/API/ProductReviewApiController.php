<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductReviewApiController extends Controller
{
    // ── GET /api/products/{slug}/reviews ──────────────────────────
    // Public — approved reviews only, paginated.
    // Returns stats + breakdown + paginated list.
    public function index(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->where('status', true)->firstOrFail();

        $baseQ = ProductReview::where('product_id', $product->id)->approved();

        // ── Rating stats — one query ──────────────────────────────
        $stats = (clone $baseQ)
            ->selectRaw(
                'COUNT(*) as total, AVG(rating) as average,
                 SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                 SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                 SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                 SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                 SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star'
            )
            ->first();

        // ── Sort ─────────────────────────────────────────────────
        $sort = $request->get('sort', 'newest');
        $query = clone $baseQ;
        match ($sort) {
            'oldest'   => $query->oldest(),
            'helpful'  => $query->orderByDesc('helpful_count')->latest(),
            'highest'  => $query->orderByDesc('rating')->latest(),
            'lowest'   => $query->orderBy('rating')->latest(),
            default    => $query->latest(),
        };

        $reviews = $query->paginate(min((int) $request->get('per_page', 10), 50));

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total'     => (int) ($stats->total ?? 0),
                    'average'   => $stats->total > 0 ? round((float) $stats->average, 1) : 0,
                    'breakdown' => [
                        5 => (int) ($stats->five_star  ?? 0),
                        4 => (int) ($stats->four_star  ?? 0),
                        3 => (int) ($stats->three_star ?? 0),
                        2 => (int) ($stats->two_star   ?? 0),
                        1 => (int) ($stats->one_star   ?? 0),
                    ],
                ],
                'reviews' => $reviews->map(fn ($r) => $this->formatPublic($r)),
            ],
            'meta' => [
                'total'        => $reviews->total(),
                'per_page'     => $reviews->perPage(),
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
            ],
        ]);
    }

    // ── POST /api/products/{slug}/reviews ─────────────────────────
    // Guest-allowed (auth optional). Rating 1-5, comment min 10 chars.
    // Auto-detects verified purchase for logged-in users.
    public function store(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->where('status', true)->firstOrFail();

        try {
            $validated = $request->validate([
                'name'         => 'required|string|max:100',
                'email'        => 'required|email|max:255',
                'title'        => 'nullable|string|max:150',
                'rating'       => 'required|integer|min:1|max:5',
                'comment'      => 'required|string|min:10|max:2000',
                'order_number' => 'nullable|string|max:100',
                'images.*'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        $user     = $request->user();   // null for guests
        $customer = $user?->customer;

        // ── Duplicate check ───────────────────────────────────────
        if ($user) {
            // Logged-in: one review per product per user
            if (ProductReview::where('product_id', $product->id)->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already submitted a review for this product.',
                ], 422);
            }
        } else {
            // Guest: one review per product per email
            if (ProductReview::where('product_id', $product->id)->where('customer_email', $validated['email'])->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'A review from this email already exists for this product.',
                ], 422);
            }
        }

        // ── Verified-purchase detection ───────────────────────────
        $isVerified = false;

        if ($user && $customer) {
            // Auto-check: completed order containing this product
            $isVerified = Order::where('status', 'delivered')
                ->where('customer_id', $customer->id)
                ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
                ->exists();

            // Fallback: manual order_number match
            if (! $isVerified && ! empty($validated['order_number'])) {
                $isVerified = Order::where('order_number', $validated['order_number'])
                    ->where('customer_id', $customer->id)
                    ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
                    ->exists();
            }
        }

        // ── Image uploads ─────────────────────────────────────────
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('product-reviews', 'public');
            }
        }

        // ── Create review (pending) ───────────────────────────────
        $review = ProductReview::create([
            'product_id'     => $product->id,
            'user_id'        => $user?->id,
            'customer_name'  => $validated['name'],
            'customer_email' => $validated['email'],
            'order_number'   => $validated['order_number'] ?? null,
            'title'          => $validated['title'] ?? null,
            'rating'         => $validated['rating'],
            'comment'        => $validated['comment'],
            'images'         => $imagePaths ?: null,
            'is_verified'    => $isVerified,
            'status'         => false, // pending admin approval
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your review! It will appear after admin approval.',
            'data'    => [
                'id'          => $review->id,
                'rating'      => $review->rating,
                'is_verified' => $review->is_verified,
                'status'      => 'pending_approval',
            ],
        ], 201);
    }

    // ── POST /api/reviews/{id}/helpful ────────────────────────────
    // Public — increment helpful_count. Simple, no auth required.
    public function helpful(string $id)
    {
        $review = ProductReview::approved()->findOrFail($id);
        $review->increment('helpful_count');

        return response()->json([
            'success'       => true,
            'helpful_count' => $review->helpful_count,
        ]);
    }

    // ── Private formatter ─────────────────────────────────────────

    private function formatPublic(ProductReview $r): array
    {
        return [
            'id'            => $r->id,
            'customer_name' => $r->customer_name,
            'title'         => $r->title,
            'rating'        => (int) $r->rating,
            'comment'       => $r->comment,
            'images'        => collect($r->images ?? [])->map(fn ($img) => asset('storage/' . $img))->values(),
            'helpful_count' => (int) $r->helpful_count,
            'is_verified'   => (bool) $r->is_verified,
            'admin_reply'   => $r->admin_reply,
            'replied_at'    => $r->admin_replied_at?->toDateString(),
            'created_at'    => $r->created_at->toDateString(),
        ];
    }
}
