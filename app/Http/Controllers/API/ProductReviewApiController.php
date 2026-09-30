<?php

namespace App\Http\Controllers\API;

use App\Rules\SafeImage;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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

        $reviews = $query->paginate(min(max((int) $request->get('per_page', 10), 1), 50));

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
    // Published right away (admin can hide it later); is_verified = the reviewer
    // bought this product — logged-in: a delivered order of theirs; guest: the
    // order_number they give plus that order's phone or email.
    public function store(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->where('status', true)->firstOrFail();

        // ── Normalise field aliases sent by the frontend ──────────
        // Frontend sends 'customer_name' and omits 'email'; support both
        // naming conventions so neither old nor new clients break.
        $input = $request->merge([
            'name'  => $request->input('name')  ?? $request->input('customer_name'),
            'email' => $request->input('email') ?? $request->input('customer_email'),
        ])->all();

        try {
            $validated = validator($input, [
                'name'         => 'required|string|max:100',
                'email'        => 'nullable|email|max:255',
                'title'        => 'nullable|string|max:150',
                'rating'       => 'required|integer|min:1|max:5',
                'comment'      => 'required|string|min:10|max:2000',
                'order_number' => 'nullable|string|max:100',
                'phone'        => 'nullable|string|max:30',
                'images.*'     => ['nullable', 'file', new SafeImage(['jpeg', 'png', 'jpg', 'webp']), 'max:2048'],
            ])->validate();
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
        } elseif (! \Illuminate\Support\Facades\Cache::add(
            'guest-review:' . $product->id . ':' . sha1((string) $request->ip()), true, now()->addDay()
        )) {
            // Guest: at most one review per product per IP per day (email is optional,
            // so without this a script could flood the moderation queue)
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted a review for this product. Please try again later.',
            ], 429);
        } elseif (! empty($validated['email'])) {
            // Guest: one review per product per email (only when email is provided)
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

        // Guest: order number + the phone or email that order was placed with
        if (! $isVerified && ! $user && ! empty($validated['order_number'])
            && (! empty($validated['email']) || ! empty($validated['phone']))) {
            $phone = ! empty($validated['phone']) ? \App\Helpers\PhoneHelper::normalize($validated['phone']) : null;
            $isVerified = Order::where('order_number', $validated['order_number'])
                ->where('status', 'delivered')
                ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
                ->where(fn ($q) => $q
                    ->when(! empty($validated['email']), fn ($q) => $q->orWhere('customer_email', $validated['email']))
                    ->when($phone, fn ($q) => $q->orWhere('customer_phone', $phone)))
                ->exists();
        }

        // ── Image uploads ─────────────────────────────────────────
        $imagePaths = [];
        if ($request->hasFile('images')) {
            $directory = public_path('storage/product-reviews');
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }
            foreach ($request->file('images') as $file) {
                $filename     = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $file->move($directory, $filename);
                $imagePaths[] = 'product-reviews/' . $filename;
            }
        }

        // ── Create review (pending) ───────────────────────────────
        $review = ProductReview::create([
            'product_id'     => $product->id,
            'user_id'        => $user?->id,
            'customer_name'  => $validated['name'],
            'customer_email' => $validated['email'] ?? null,
            'order_number'   => $validated['order_number'] ?? null,
            'title'          => $validated['title'] ?? null,
            'rating'         => $validated['rating'],
            'comment'        => $validated['comment'],
            'images'         => $imagePaths ?: null,
            'is_verified'    => $isVerified,
            'status'         => true, // shown right away; admin can hide it (Unverified badge when not bought)
        ]);

        // Notify all admins of the new product review submission
        try {
            $admins = \App\Models\User::role('admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\ProductReviewSubmittedNotification($review));
            }
        } catch (\Throwable $notifyEx) {
            \Illuminate\Support\Facades\Log::error('ProductReviewSubmittedNotification dispatch failed', [
                'product_review_id' => $review->id,
                'error'             => $notifyEx->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your review!',
            'data'    => $this->formatPublic($review->fresh()),
        ], 201);
    }

    // ── POST /api/reviews/{id}/helpful ────────────────────────────
    // Public — increment helpful_count. Simple, no auth required.
    public function helpful(Request $request, string $id)
    {
        $review = ProductReview::approved()->findOrFail($id);

        // One vote per review per IP for 30 days — stops a script inflating the count
        $voteKey = 'review-helpful:' . $review->id . ':' . sha1((string) $request->ip());
        if (! \Illuminate\Support\Facades\Cache::add($voteKey, true, now()->addDays(30))) {
            return response()->json([
                'success'       => false,
                'message'       => 'You have already marked this review as helpful.',
                'helpful_count' => (int) $review->helpful_count,
            ], 429);
        }

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
