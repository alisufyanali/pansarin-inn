<?php

use App\Http\Controllers\API\AuthApiController;
use App\Http\Controllers\API\BlogApiController;
use App\Http\Controllers\API\CartApiController;
use App\Http\Controllers\API\ContactApiController;
use App\Http\Controllers\API\CouponApiController;
use App\Http\Controllers\API\HealthConcernApiController;
use App\Http\Controllers\API\HomepageApiController;
use App\Http\Controllers\API\NewsletterApiController;
use App\Http\Controllers\API\NotificationApiController;
use App\Http\Controllers\API\OffersApiController;
use App\Http\Controllers\API\OrderApiController;
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

// ── Public routes — generous rate limit (60 requests/minute) ──────
Route::middleware('throttle:60,1')->group(function () {

    // Products — with-video and recommended must come before {slug} wildcard
    Route::get('/products/featured',     [ProductApiController::class, 'featured']);
    Route::get('/products/with-video',   [ProductApiController::class, 'withVideo']);
    Route::get('/products/recommended',  [ProductApiController::class, 'recommended']);
    Route::get('/products',              [ProductApiController::class, 'index']);
    Route::get('/products/{slug}',       [ProductApiController::class, 'show']);
    Route::get('/products/{slug}/related', [ProductApiController::class, 'related']);
    Route::get('/categories',            [ProductApiController::class, 'categories']);

    // Health Concerns
    Route::get('/health-concerns',     [HealthConcernApiController::class, 'index']);

    // Product reviews — public read, public write (guest-allowed), helpful vote
    Route::get('/products/{slug}/reviews',  [ProductReviewApiController::class, 'index']);
    Route::post('/products/{slug}/reviews', [ProductReviewApiController::class, 'store']);
    Route::post('/reviews/{id}/helpful',    [ProductReviewApiController::class, 'helpful']);

    // Homepage
    Route::get('/homepage',                   [HomepageApiController::class, 'index']);
    Route::get('/homepage/category-products', [ProductApiController::class, 'homepageCategoryProducts']);
    Route::get('/homepage/reviews',           [HomepageApiController::class, 'reviews']);
    Route::get('/slides',                     [HomepageApiController::class, 'slides']);

    // Site-wide reviews — public read, public write (order-verified)
    Route::get('/reviews',  [SiteReviewApiController::class, 'index']);
    Route::post('/reviews', [SiteReviewApiController::class, 'store']);

    // Blogs
    Route::get('/blogs',        [BlogApiController::class, 'index']);
    Route::get('/blogs/{slug}', [BlogApiController::class, 'show']);

    // Offers / active coupons (public — shows available promotions)
    Route::get('/offers', [OffersApiController::class, 'index']);

    // Misc public
    Route::post('/contact',              [ContactApiController::class, 'store']);
    Route::post('/coupons/validate',     [CouponApiController::class, 'check']);
    Route::post('/newsletter/subscribe', [NewsletterApiController::class, 'subscribe']);
    Route::get('/orders/track',          [OrderApiController::class, 'track']);
    Route::post('/orders/guest',         [OrderApiController::class, 'storeGuest']);
});

// ── Protected routes (auth:sanctum) — 60 requests/minute ──────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::post('/logout', [AuthApiController::class, 'logout']);
    Route::get('/user',    [AuthApiController::class, 'user']);

    // Profile
    Route::put('/profile',         [ProfileApiController::class, 'update']);
    Route::post('/change-password', [ProfileApiController::class, 'changePassword']);

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
