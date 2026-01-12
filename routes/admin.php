<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\UserController;
use App\Http\Controllers\Admin\{
    RoleController,
    CategoryController,
    ProductController,
    ProductVariantController,
    ProductAttributeController,
    OrderController,
    CustomerController,
    CouponController,
    BlogController,
    BlogCategoryController,
    BlogsCommentsController,
    NotificationController,
    FrontendContentController,
    NewsletterController,
    BlogTagsController,
    InventoryController
};

Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    // ->name('admin.')
    ->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', fn () => Inertia::render('dashboard'))
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Live Search
    |--------------------------------------------------------------------------
    */
    Route::get('customers/search', [CustomerController::class, 'search'])
        ->name('customers.search');

    Route::get('products/search', [ProductController::class, 'search'])
        ->name('products.search');

    /*
    |--------------------------------------------------------------------------
    | Users & Roles
    |--------------------------------------------------------------------------
    */
    Route::resource('users', UserController::class);
    Route::get('users-data', [UserController::class, 'getData'])
        ->name('users.data');

    Route::resource('roles', RoleController::class);
    Route::get('roles-data', [RoleController::class, 'getData'])
        ->name('roles.data');

    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */
    Route::resource('categories', CategoryController::class);
    Route::get('categories-data', [CategoryController::class, 'getData'])
        ->name('categories.data');

    /*
    |--------------------------------------------------------------------------
    | Products
    |--------------------------------------------------------------------------
    */
    Route::resource('products', ProductController::class);
    Route::get('products-data', [ProductController::class, 'getData'])
        ->name('products.data');

    Route::resource('product-variants', ProductVariantController::class);
    Route::get('product-variants-data', [ProductVariantController::class, 'getData'])
        ->name('product-variants.data');

    Route::resource('attributes', ProductAttributeController::class);
    Route::get('attributes-data', [ProductAttributeController::class, 'getData'])
        ->name('attributes.data');

    /*
    |--------------------------------------------------------------------------
    | Orders
    |--------------------------------------------------------------------------
    */
    Route::resource('orders', OrderController::class);
    Route::get('orders-data', [OrderController::class, 'getData'])
        ->name('orders.data');

    Route::post('orders/{order}/status', [OrderController::class, 'updateStatus'])
        ->name('orders.updateStatus');

    Route::post('orders/{order}/payment', [OrderController::class, 'updatePaymentStatus'])
        ->name('orders.updatePayment');

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */
    Route::resource('customers', CustomerController::class);
    Route::get('customers-data', [CustomerController::class, 'getData'])
        ->name('customers.data');

    /*
    |--------------------------------------------------------------------------
    | Coupons
    |--------------------------------------------------------------------------
    */
    Route::resource('coupons', CouponController::class);
    Route::get('coupons-data', [CouponController::class, 'getData'])
        ->name('coupons.data');

    Route::post('coupons/{coupon}/toggle', [CouponController::class, 'toggleStatus'])
        ->name('coupons.toggle');

    /*
    |--------------------------------------------------------------------------
    | Blogs
    |--------------------------------------------------------------------------
    */
    Route::resource('blogcategories', BlogCategoryController::class);
    Route::get('blogcategories-data', [BlogCategoryController::class, 'getData'])
        ->name('blogcategories.data');

    Route::resource('blogs', BlogController::class);
    Route::get('blogs-data', [BlogController::class, 'getData'])
        ->name('blogs.data');

    //Blogs Comments Routes
    Route::resource('blogscomments', BlogsCommentsController::class);
    Route::get('blogscomments-data', [BlogsCommentsController::class, 'getData'])->name('blogscomments.data');


    // Blog Tags Routes
    Route::resource('blogstags', BlogTagsController::class);
    Route::get('blogstags-data', [BlogTagsController::class, 'getData'])->name('blogstags.data');
    Route::get('blogstags-active', [BlogTagsController::class, 'getActiveTags'])->name('blogstags.active');

    // Inventory Management
    Route::resource('inventory', InventoryController::class);
    Route::get('inventory-data', [InventoryController::class, 'getData'])->name('inventory.data');
    Route::get('low-stock-products', [InventoryController::class, 'getLowStockProducts'])->name('inventory.low-stock');

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index'])
        ->name('notifications.index');

    Route::get('notifications/unread', [NotificationController::class, 'unread'])
        ->name('notifications.unread');

    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');

    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.readAll');

    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])
        ->name('notifications.destroy');

    /*
    |--------------------------------------------------------------------------
    | Frontend Content
    |--------------------------------------------------------------------------
    */
    Route::resource('frontend', FrontendContentController::class);
    Route::get('frontend-data', [FrontendContentController::class, 'getData'])
        ->name('frontend.data');



    Route::resource('newsletters', NewsletterController::class);
    Route::get('newsletters-data', [NewsletterController::class, 'getData'])->name('newsletters.data');


});
