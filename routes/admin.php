<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductVariantController;
use Inertia\Inertia; 

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // User Management resources Controllers
    Route::resource('users', UserController::class);

    // Role Management resources Controllers
    Route::resource('roles', RoleController::class);

    // Category Management resource Controllers
    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class);

    // Product Management resource Controllers
    Route::resource('products', \App\Http\Controllers\Admin\ProductController::class);
    Route::resource('product-variants', \App\Http\Controllers\Admin\ProductVariantController::class);
    Route::resource('attributes', \App\Http\Controllers\Admin\ProductAttributeController::class);

});

Route::middleware('auth')->prefix('admin')->group(function () {
    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index'])
        ->name('notifications.index');
    Route::get('/notifications/unread', [NotificationController::class, 'unread'])
        ->name('notifications.unread');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.readAll');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])
        ->name('notifications.destroy');
});