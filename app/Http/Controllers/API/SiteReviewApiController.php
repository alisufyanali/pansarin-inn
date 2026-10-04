<?php

namespace App\Http\Controllers\API;

use App\Rules\SafeImage;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Helpers\PhoneHelper;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SiteReviewApiController extends Controller
{
    /**
     * GET /api/reviews
     *
     * Public — one feed of approved site-wide reviews AND approved product
     * reviews, so the /reviews page is not empty while product reviews exist.
     * Supports: per_page, sort (newest|oldest|highest_rating|lowest_rating), search (reviewer name).
     */
    public function index(Request $request)
    {
        $search = $request->filled('search')
            ? '%' . addcslashes((string) $request->search, '%_\\') . '%'
            : null;

        $site = DB::table('site_reviews')
            ->where('status', 'approved')
            ->when($search, fn ($q) => $q->where('reviewer_name', 'like', $search))
            ->select([
                'id', DB::raw("'site' as source"), 'reviewer_name as name', 'rating', 'comment',
                'image', DB::raw('NULL as product_id'), DB::raw('1 as verified'), 'created_at',
            ]);

        $product = DB::table('product_reviews')
            ->where('status', true)
            ->when($search, fn ($q) => $q->where('customer_name', 'like', $search))
            ->select([
                'id', DB::raw("'product' as source"), 'customer_name as name', 'rating', 'comment',
                DB::raw('NULL as image'), 'product_id', 'is_verified as verified', 'created_at',
            ]);

        $query = DB::query()->fromSub($site->unionAll($product), 'r');

        match ($request->input('sort', 'newest')) {
            'oldest'         => $query->orderBy('created_at')->orderBy('id'),
            'highest_rating' => $query->orderByDesc('rating')->orderByDesc('created_at'),
            'lowest_rating'  => $query->orderBy('rating')->orderByDesc('created_at'),
            default          => $query->orderByDesc('created_at')->orderByDesc('id'),
        };

        $reviews = $query->paginate(min(max((int) $request->input('per_page', 12), 1), 50));

        $products = Product::whereIn('id', collect($reviews->items())->pluck('product_id')->filter()->unique())
            ->get(['id', 'name', 'slug', 'thumbnail'])
            ->keyBy('id');

        return response()->json([
            'success' => true,
            'data'    => collect($reviews->items())->map(fn ($r) => $this->formatPublic($r, $products)),
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
        // ── Normalise field aliases sent by the frontend ──────────
        // Frontend sends 'customer_name' and 'email'; accept both naming
        // conventions so old and new clients continue to work.
        $input = array_merge($request->all(), [
            'reviewer_name'  => $request->input('reviewer_name')  ?? $request->input('customer_name'),
            'reviewer_email' => $request->input('reviewer_email') ?? $request->input('email'),
            'reviewer_phone' => $request->input('reviewer_phone') ?? $request->input('phone'),
        ]);

        try {
            // The order can be verified by the phone OR the email used at checkout
            // (email is optional at checkout, phone is not).
            $validated = validator($input, [
                'reviewer_name'  => 'required|string|max:255',
                'reviewer_email' => 'nullable|required_without:reviewer_phone|email|max:255',
                'reviewer_phone' => 'nullable|required_without:reviewer_email|string|max:30',
                'order_number'   => 'required|string|max:100',
                'rating'         => 'required|integer|min:1|max:5',
                'comment'        => 'required|string|min:10|max:2000',
                'image'          => ['nullable', 'file', new SafeImage(['jpeg', 'png', 'jpg', 'webp']), 'max:2048'],
            ], [
                'reviewer_email.required_without' => 'Please enter the phone number or email used on the order.',
                'reviewer_phone.required_without' => 'Please enter the phone number or email used on the order.',
            ])->validate();
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        // ── 1. Find the order and verify the reviewer owns it ─────
        // "Not found" and "details don't match" return the same message so the
        // endpoint cannot be used to discover which order numbers exist.
        $order    = Order::where('order_number', trim($validated['order_number']))->first();
        $customer = $order ? Customer::find($order->customer_id) : null;

        $email = strtolower(trim((string) ($validated['reviewer_email'] ?? '')));
        $phone = PhoneHelper::normalize($validated['reviewer_phone'] ?? null);

        $owns = $customer && (
            ($email !== '' && strtolower(trim((string) $customer->email)) === $email)
            || ($phone !== null && PhoneHelper::normalize($customer->phone) === $phone)
        );

        if (! $owns) {
            $msg = 'We could not find an order matching this order number and phone/email.';
            return response()->json([
                'success' => false,
                'message' => $msg,
                'errors'  => ['order_number' => [$msg]],
            ], 422);
        }

        // ── 2. Only delivered orders can be reviewed ──────────────
        // display_status is Sale-aware — orders.status is often frozen at
        // 'processing' even after the linked Sale has been marked delivered.
        $order->loadMissing('sale');

        if ($order->display_status !== 'delivered') {
            $msg = 'Only delivered orders are eligible for a review.';
            return response()->json([
                'success' => false,
                'message' => $msg,
                'errors'  => ['order_number' => [$msg]],
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
            $file      = $request->file('image');
            $directory = public_path('storage/site-reviews');
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }
            $filename  = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $file->move($directory, $filename);
            $imagePath = 'site-reviews/' . $filename;
        }

        // ── 5. Create review (pending — requires admin approval) ──
        $review = SiteReview::create([
            'order_id'       => $order->id,
            'order_number'   => $order->order_number,
            'reviewer_name'  => $validated['reviewer_name'],
            // Column is NOT NULL — phone-verified reviewers get the order's email (or '').
            'reviewer_email' => $email !== '' ? $email : (string) ($customer->email ?? ''),
            'rating'         => $validated['rating'],
            'comment'        => $validated['comment'],
            'image'          => $imagePath,
            'status'         => 'pending',
        ]);

        // Notify all admins of the new site review submission
        try {
            $admins = \App\Models\User::notifiableStaff()->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\SiteReviewSubmittedNotification($review));
            }
        } catch (\Throwable $notifyEx) {
            \Illuminate\Support\Facades\Log::error('SiteReviewSubmittedNotification dispatch failed', [
                'site_review_id' => $review->id,
                'error'          => $notifyEx->getMessage(),
            ]);
        }

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

    /** Row from the site/product union in index(). */
    private function formatPublic(object $r, $products): array
    {
        $product = $r->product_id ? $products->get($r->product_id) : null;

        return [
            // Prefixed so ids from the two tables never collide in the feed.
            'id'            => ($r->source === 'site' ? 's' : 'p') . $r->id,
            'source'        => $r->source,
            'customer_name' => $r->name,
            'reviewer_name' => $r->name, // kept for older clients
            'rating'        => (int) $r->rating,
            'comment'       => $r->comment,
            'verified'      => (bool) $r->verified,
            'image'         => $r->image ? asset('storage/' . $r->image) : null,
            'created_at'    => substr((string) $r->created_at, 0, 10),
            'product'       => $product ? [
                'id'        => $product->id,
                'name'      => $product->name,
                'slug'      => $product->slug,
                'thumbnail' => $product->thumbnail ? asset('storage/' . $product->thumbnail) : null,
            ] : null,
        ];
    }
}
