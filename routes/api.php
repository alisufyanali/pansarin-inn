<?php

use App\Http\Controllers\API\AuthApiController;
use App\Http\Controllers\API\BlogApiController;
use App\Http\Controllers\API\CartApiController;
use App\Http\Controllers\API\ContactApiController;
use App\Http\Controllers\API\CouponApiController;
use App\Http\Controllers\API\OrderApiController;
use App\Http\Controllers\API\ProductApiController;
use App\Http\Controllers\API\WishlistApiController;
use Illuminate\Support\Facades\Route;

// ── Public Routes ─────────────────────────────────────────────────
Route::post('/login',    [AuthApiController::class, 'login']);
Route::post('/register', [AuthApiController::class, 'register']);

Route::get('/products/featured',  [ProductApiController::class, 'featured']);
Route::get('/products',           [ProductApiController::class, 'index']);
Route::get('/products/{slug}',    [ProductApiController::class, 'show']);
Route::get('/categories',         [ProductApiController::class, 'categories']);

Route::get('/blogs',         [BlogApiController::class, 'index']);
Route::get('/blogs/{slug}',  [BlogApiController::class, 'show']);

Route::post('/contact',           [ContactApiController::class, 'store']);
Route::post('/coupons/validate',  [CouponApiController::class, 'check']);

// ── Protected Routes (auth:sanctum) ───────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthApiController::class, 'logout']);
    Route::get('/user',    [AuthApiController::class, 'user']);

    // Cart
    Route::get('/cart',          [CartApiController::class, 'index']);
    Route::post('/cart',         [CartApiController::class, 'store']);
    Route::patch('/cart/{id}',   [CartApiController::class, 'update']);
    Route::delete('/cart/{id}',  [CartApiController::class, 'destroy']);
    Route::delete('/cart',       [CartApiController::class, 'clear']);

    // Orders
    Route::get('/orders',       [OrderApiController::class, 'index']);
    Route::post('/orders',      [OrderApiController::class, 'store']);
    Route::get('/orders/{id}',  [OrderApiController::class, 'show']);

    // Wishlist
    Route::get('/wishlist',          [WishlistApiController::class, 'index']);
    Route::post('/wishlist',         [WishlistApiController::class, 'store']);
    Route::delete('/wishlist/{id}',  [WishlistApiController::class, 'destroy']);
});
