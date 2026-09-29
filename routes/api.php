<?php

use App\Http\Controllers\API\AffiliateApiController;
use App\Http\Controllers\API\AuthApiController;
use App\Http\Controllers\API\BlogApiController;
use App\Http\Controllers\API\CartApiController;
use App\Http\Controllers\API\CityApiController;
use App\Http\Controllers\API\ContactApiController;
use App\Http\Controllers\API\CouponApiController;
use App\Http\Controllers\API\DealApiController;
use App\Http\Controllers\API\HealthConcernApiController;
use App\Http\Controllers\API\HomepageApiController;
use App\Http\Controllers\API\NewsletterApiController;
use App\Http\Controllers\API\NotificationApiController;
use App\Http\Controllers\API\OffersApiController;
use App\Http\Controllers\API\OrderApiController;
use App\Http\Controllers\API\PasswordResetApiController;
use App\Http\Controllers\API\ProductApiController;
use App\Http\Controllers\API\ProductReviewApiController;
use App\Http\Controllers\API\ProfileApiController;
use App\Http\Controllers\API\ReturnApiController;
use App\Http\Controllers\API\RewardsApiController;
use App\Http\Controllers\API\SiteReviewApiController;
use App\Http\Controllers\API\SupportApiController;
use App\Http\Controllers\API\WishlistApiController;
use Illuminate\Support\Facades\Route;

// ── Auth routes — strict rate limit (10 requests/minute) ──────────
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login',    [AuthApiController::class, 'login']);
    Route::post('/register', [AuthApiController::class, 'register']);
});

// ── Storefront password reset (proxied by the Next.js /api/auth/* route handlers) ──
Route::post('/forgot-password', [PasswordResetApiController::class, 'forgot'])->middleware('throttle:api.password-reset');
Route::post('/reset-password',  [PasswordResetApiController::class, 'reset'])->middleware('throttle:api.password-reset');

// ── Public routes — build-server aware rate limit (api.public limiter) ──
// Normal traffic: 60 req/min per IP.
// Next.js build server: 1000 req/min when X-Build-Token header matches BUILD_API_TOKEN.
Route::middleware('throttle:api.public')->group(function () {

    // Products — with-video and recommended must come before {slug} wildcard
    Route::get('/products/featured',     [ProductApiController::class, 'featured']);
    Route::get('/products/with-video',   [ProductApiController::class, 'withVideo']);
    Route::get('/products/recommended',  [ProductApiController::class, 'recommended']);
    Route::post('/products/check-stock', [ProductApiController::class, 'checkStock']);
    Route::get('/products',              [ProductApiController::class, 'index']);
    Route::get('/products/{slug}',       [ProductApiController::class, 'show']);
    Route::get('/products/{slug}/related', [ProductApiController::class, 'related']);
    Route::get('/categories',            [ProductApiController::class, 'categories']);
    Route::get('/cities',                [CityApiController::class, 'index']);

    // Health Concerns
    Route::get('/health-concerns',     [HealthConcernApiController::class, 'index']);

    // Product reviews — public read, public write (guest-allowed), helpful vote
    Route::get('/products/{slug}/reviews',  [ProductReviewApiController::class, 'index']);
    Route::post('/products/{slug}/reviews', [ProductReviewApiController::class, 'store'])->middleware('throttle:api.reviews');
    Route::post('/reviews/{id}/helpful',    [ProductReviewApiController::class, 'helpful']);

    // Homepage
    Route::get('/homepage',                   [HomepageApiController::class, 'index']);
    Route::get('/homepage/category-products', [ProductApiController::class, 'homepageCategoryProducts']);
    Route::get('/homepage/reviews',           [HomepageApiController::class, 'reviews']);
    Route::get('/slides',                     [HomepageApiController::class, 'slides']);

    // Site-wide reviews — public read, public write (order-verified)
    Route::get('/reviews',  [SiteReviewApiController::class, 'index']);
    Route::post('/reviews', [SiteReviewApiController::class, 'store'])->middleware('throttle:api.reviews');

    // Blogs
    Route::get('/blog-categories', [BlogApiController::class, 'categories']);
    Route::get('/blog-tags',      [BlogApiController::class, 'tags']);
    Route::get('/blogs',          [BlogApiController::class, 'index']);
    Route::get('/blogs/{slug}',   [BlogApiController::class, 'show']);

    // Offers / active coupons (public — shows available promotions)
    Route::get('/offers', [OffersApiController::class, 'index']);

    // Misc public
    // Write endpoints that send mail / create records get a tighter per-IP limit
    Route::post('/contact',              [ContactApiController::class, 'store'])->middleware('throttle:api.forms');
    Route::post('/coupons/validate',     [CouponApiController::class, 'check'])->middleware('throttle:api.coupons');
    Route::post('/newsletter/subscribe', [NewsletterApiController::class, 'subscribe'])->middleware('throttle:api.forms');
    Route::get('/orders/track',          [OrderApiController::class, 'track'])->middleware('throttle:orders.track');
    Route::post('/orders/guest',         [OrderApiController::class, 'storeGuest'])->middleware('throttle:api.guest-orders');
    Route::post('/checkout/quote',       [OrderApiController::class, 'quote']);

    // Affiliate (referral) program
    Route::post('/affiliate/apply', [AffiliateApiController::class, 'apply'])->middleware('throttle:api.forms');
    Route::post('/affiliate/click', [AffiliateApiController::class, 'click']);

    // Deals (admin → Product Deals)
    Route::get('/deals',        [DealApiController::class, 'index']);
    Route::get('/deals/{slug}', [DealApiController::class, 'show']);
});

// ── Protected routes (auth:sanctum) — 60 requests/minute ──────────
Route::middleware(['auth:sanctum', 'throttle:60,1', 'password.changed'])->group(function () {
    Route::post('/logout', [AuthApiController::class, 'logout'])->name('api.logout');
    Route::get('/user',    [AuthApiController::class, 'user']);

    // Profile
    Route::put('/profile',          [ProfileApiController::class, 'update']);
    Route::post('/change-password', [ProfileApiController::class, 'changePassword'])->name('password.change');

    // Cart
    Route::get('/cart',         [CartApiController::class, 'index']);
    Route::post('/cart',        [CartApiController::class, 'store']);
    Route::patch('/cart/{id}',  [CartApiController::class, 'update']);
    Route::delete('/cart/{id}', [CartApiController::class, 'destroy']);
    Route::delete('/cart',      [CartApiController::class, 'clear']);

    // Orders
    Route::get('/orders',              [OrderApiController::class, 'index']);
    Route::post('/orders',             [OrderApiController::class, 'store']);
    Route::get('/orders/{id}',         [OrderApiController::class, 'show']);
    Route::patch('/orders/{id}/cancel',[OrderApiController::class, 'cancel']);

    // Wishlist
    Route::get('/wishlist',         [WishlistApiController::class, 'index']);
    Route::post('/wishlist',        [WishlistApiController::class, 'store']);
    Route::delete('/wishlist/{id}', [WishlistApiController::class, 'destroy']);

    // Affiliate application for the signed-in customer
    Route::post('/affiliate/apply-me', [AffiliateApiController::class, 'applyAuthenticated']);
    Route::get('/affiliate/status',    [AffiliateApiController::class, 'status']);

    // Rewards (loyalty points)
    Route::get('/rewards', [RewardsApiController::class, 'index']);

    // Returns
    Route::get('/returns',  [ReturnApiController::class, 'index']);
    Route::post('/returns', [ReturnApiController::class, 'store']);

    // Support tickets
    Route::get('/support',  [SupportApiController::class, 'index']);
    Route::post('/support', [SupportApiController::class, 'store']);

    // Notifications
    Route::get('/notifications',               [NotificationApiController::class, 'index']);
    Route::patch('/notifications/{id}/read',   [NotificationApiController::class, 'markRead']);
    Route::post('/notifications/read-all',     [NotificationApiController::class, 'markAllRead']);

    // Product reviews — write still available while authenticated (keeps backward compat)
    // POST is also available publicly above; auth version adds user_id automatically
});
