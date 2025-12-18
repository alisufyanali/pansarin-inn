<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\CustomerController;

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
    Route::resource('categories', CategoryController::class);
    Route::get('categories-data', [CategoryController::class, 'getData'])->name('categories-data');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Product Management resource Controllers
    Route::resource('products', ProductController::class);
    Route::get('products-data', [ProductController::class, 'getData'])->name('products.data');

    Route::resource('product-variants', ProductVariantController::class);
    Route::get('product-variants-data', [ProductVariantController::class, 'getData'])->name('product-variants.data');

    Route::resource('attributes', ProductAttributeController::class);

    Route::resource('orders', OrderController::class);

    // Customers Routes
    Route::resource('customers', CustomerController::class);
    Route::get('customers-data', [CustomerController::class, 'getData'])->name('customers.data');
    
    
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