<?php

use App\Http\Controllers\Admin\BlogCategoryController;
use App\Http\Controllers\Admin\BlogController;
// Controllers
use App\Http\Controllers\Admin\BlogsCommentsController;
use App\Http\Controllers\Admin\BlogTagController;
use App\Http\Controllers\Admin\BlogTagsController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\FrontendContentController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\NewsletterController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\ProductAttributeController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductsDealController;
use App\Http\Controllers\Admin\ProductsReviewsController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SaleController;
use App\Http\Controllers\Admin\WhatsAppController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Live Search
    |--------------------------------------------------------------------------
    */
    Route::get('customers/search', [CustomerController::class, 'search'])->name('customers.search');
    Route::get('products/search', [ProductController::class, 'search'])->name('products.search');

    /*
    |--------------------------------------------------------------------------
    | Users & Roles
    |--------------------------------------------------------------------------
    */
    Route::resource('users', UserController::class);
    Route::get('users-data', [UserController::class, 'getData'])->name('users.data');

    Route::resource('roles', RoleController::class);
    Route::get('roles-data', [RoleController::class, 'getData'])->name('roles.data');

    Route::resource('permissions', PermissionController::class);
    Route::get('permissions-data', [PermissionController::class, 'getData'])->name('permissions.data');

    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */
    Route::resource('categories', CategoryController::class);
    Route::get('categories-data', [CategoryController::class, 'getData'])->name('categories-data');
    // Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Product Management resource Controllers
    Route::resource('products', ProductController::class);
    Route::get('products-data', [ProductController::class, 'getData'])->name('products.data');
    Route::resource('product-variants', ProductVariantController::class);
    Route::get('product-variants-data', [ProductVariantController::class, 'getData'])->name('product-variants.data');
    Route::resource('attributes', ProductAttributeController::class);
    Route::get('attributes-data', [ProductAttributeController::class, 'getData'])->name('attributes.data');

    Route::resource('deals', ProductsDealController::class);
    Route::get('deals-data', [ProductsDealController::class, 'getData'])->name('products.data');

    Route::resource('reviews', ProductsReviewsController::class);
    Route::get('reviews-data', [ProductsReviewsController::class, 'getData'])->name('reviews.data');
    Route::patch('reviews/{review}/status', [ProductsReviewsController::class, 'updateStatus'])->name('reviews.status');

    /*
    |--------------------------------------------------------------------------
    | Orders
    |--------------------------------------------------------------------------
    */
    Route::resource('orders', OrderController::class);
    Route::get('orders-data', [OrderController::class, 'getData'])->name('orders.data');
    Route::post('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');
    Route::post('orders/{order}/payment', [OrderController::class, 'updatePaymentStatus'])->name('orders.updatePayment');

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */
    Route::resource('customers', CustomerController::class);
    Route::get('customers-data', [CustomerController::class, 'getData'])->name('customers.data');

    /*
    |--------------------------------------------------------------------------
    | Coupons
    |--------------------------------------------------------------------------
    */
    Route::resource('coupons', CouponController::class);
    Route::get('coupons-data', [CouponController::class, 'getData'])->name('coupons.data');
    Route::post('coupons/{coupon}/toggle', [CouponController::class, 'toggleStatus'])->name('coupons.toggle');

    /*
    |--------------------------------------------------------------------------
    | Blogs
    |--------------------------------------------------------------------------
    */
    Route::resource('blogcategories', BlogCategoryController::class);
    Route::get('blogcategories-data', [BlogCategoryController::class, 'getData'])->name('blogcategories.data');

    Route::resource('blogtags', BlogTagController::class);
    Route::get('blogtags-data', [BlogTagController::class, 'getData'])->name('blogtags.data');
    Route::get('blogtags-active', [BlogTagsController::class, 'getActiveTags'])->name('blogstags.active');

    Route::post('blogs/{blog}', [BlogController::class, 'update'])->middleware('permission:edit.blogs');
    Route::resource('blogs', BlogController::class);
    Route::get('blogs-data', [BlogController::class, 'getData'])->name('blogs.data');
    Route::post('blogs/{blog}/update', [BlogController::class, 'update']);

    // Blogs Comments Routes
    Route::resource('blogscomments', BlogsCommentsController::class);
    Route::get('blogscomments-data', [BlogsCommentsController::class, 'getData'])->name('blogscomments.data');

    // Inventory Management
    Route::resource('inventory', InventoryController::class);
    Route::get('inventory-data', [InventoryController::class, 'getData'])->name('inventory.data');
    Route::get('low-stock-products', [InventoryController::class, 'getLowStockProducts'])->name('inventory.low-stock');

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    /*
    |--------------------------------------------------------------------------
    | Frontend Content
    |--------------------------------------------------------------------------
    */
    Route::resource('frontend', FrontendContentController::class);
    Route::get('frontend-data', [FrontendContentController::class, 'getData'])->name('frontend.data');

    Route::resource('newsletters', NewsletterController::class);
    Route::get('newsletters-data', [NewsletterController::class, 'getData'])->name('newsletters.data');

    // WhatsApp Chat Routes
    Route::prefix('whatsapp')->name('whatsapp.')->group(function () {
        Route::get('/chat', [WhatsAppController::class, 'index'])->name('chat');
        Route::get('/phone-numbers', [WhatsAppController::class, 'getPhoneNumbers'])->name('phone-numbers');
        Route::get('/messages/{phone}', [WhatsAppController::class, 'getMessages'])->name('messages');
        Route::post('/send', [WhatsAppController::class, 'sendMessage'])->name('send');
    });

    // Sales CRUD
    Route::resource('sales', SaleController::class);

    // Sales DataTable endpoint
    Route::get('sales-data', [SaleController::class, 'getData'])->name('sales.data');

    // Update delivery status
    Route::patch('sales/{sale}/delivery-status', [SaleController::class, 'updateDeliveryStatus'])
        ->name('sales.update-delivery-status');

    // Update payment status
    Route::patch('sales/{sale}/payment-status', [SaleController::class, 'updatePaymentStatus'])
        ->name('sales.update-payment-status');

    // Contact Routes

    // Contacts CRUD
    // Route::resource('contacts', ContactController::class)->except(['create', 'store']);
    Route::resource('contacts', ContactController::class);

    // Contacts DataTable endpoint
    Route::get('contacts-data', [ContactController::class, 'getData'])->name('contacts.data');

    // Update status
    Route::patch('contacts/{contact}/status', [ContactController::class, 'updateStatus'])
        ->name('contacts.update-status');

    // Reply to contact
    Route::post('contacts/{contact}/reply', [ContactController::class, 'reply'])
        ->name('contacts.reply');

    // Bulk actions
    Route::post('contacts/bulk-delete', [ContactController::class, 'bulkDelete'])
        ->name('contacts.bulk-delete');

    Route::post('contacts/bulk-update-status', [ContactController::class, 'bulkUpdateStatus'])
        ->name('contacts.bulk-update-status');

});
