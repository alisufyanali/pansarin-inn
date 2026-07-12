<?php

use App\Http\Controllers\API\AuthApiController;
use App\Http\Controllers\API\BlogApiController;
use App\Http\Controllers\API\CartApiController;
use App\Http\Controllers\API\ContactApiController;
use App\Http\Controllers\API\CouponApiController;
use App\Http\Controllers\API\HomepageApiController;
use App\Http\Controllers\API\NewsletterApiController;
use App\Http\Controllers\API\OrderApiController;
use App\Http\Controllers\API\ProductApiController;
use App\Http\Controllers\API\WishlistApiController;
use Illuminate\Support\Facades\Route;

// ── Auth routes — strict rate limit (10 requests/minute) ──────────
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login',    [AuthApiController::class, 'login']);
    Route::post('/register', [AuthApiController::class, 'register']);
});

// ── Public routes — generous rate limit (60 requests/minute) ──────
Route::middleware('throttle:60,1')->group(function () {

    // Products — with-video must come before {slug} wildcard
    Route::get('/products/featured',   [ProductApiController::class, 'featured']);
    Route::get('/products/with-video', [ProductApiController::class, 'withVideo']);
    Route::get('/products',            [ProductApiController::class, 'index']);
    Route::get('/products/{slug}',     [ProductApiController::class, 'show']);
    Route::get('/categories',          [ProductApiController::class, 'categories']);

    // Homepage
    Route::get('/homepage',                   [HomepageApiController::class, 'index']);
    Route::get('/homepage/category-products', [ProductApiController::class, 'homepageCategoryProducts']);
    Route::get('/homepage/reviews',           [HomepageApiController::class, 'reviews']);
    Route::get('/slides',                     [HomepageApiController::class, 'slides']);

    // Blogs
    Route::get('/blogs',        [BlogApiController::class, 'index']);
    Route::get('/blogs/{slug}', [BlogApiController::class, 'show']);

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

    // Cart
    Route::get('/cart',         [CartApiController::class, 'index']);
    Route::post('/cart',        [CartApiController::class, 'store']);
    Route::patch('/cart/{id}',  [CartApiController::class, 'update']);
    Route::delete('/cart/{id}', [CartApiController::class, 'destroy']);
    Route::delete('/cart',      [CartApiController::class, 'clear']);

    // Orders
    Route::get('/orders',      [OrderApiController::class, 'index']);
    Route::post('/orders',     [OrderApiController::class, 'store']);
    Route::get('/orders/{id}', [OrderApiController::class, 'show']);

    // Wishlist
    Route::get('/wishlist',         [WishlistApiController::class, 'index']);
    Route::post('/wishlist',        [WishlistApiController::class, 'store']);
    Route::delete('/wishlist/{id}', [WishlistApiController::class, 'destroy']);
});
