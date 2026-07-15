<?php
use App\Http\Controllers\Admin\Settings\GeneralSettingController;
use App\Http\Controllers\Admin\Settings\UiSettingController;
use App\Http\Controllers\Admin\Settings\BusinessSettingController;

use App\Http\Controllers\Api\FrontendController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permission:view.settings'])->prefix('admin/settings/ui')->name('admin.ui-settings.')->group(function () {
    Route::get('/', [UiSettingController::class, 'index'])->name('index');
});

Route::middleware(['auth', 'verified', 'permission:edit.settings'])->prefix('admin/settings/ui')->name('admin.ui-settings.update.')->group(function () {
    Route::Post('/branding',[UiSettingController::class, 'updateBrandingUI'])->name('updateBrandingUI');
    Route::Post('/header',[UiSettingController::class, 'updateHeaderUI'])->name('updateHeaderUI');
    Route::Post('/homepage',[UiSettingController::class, 'updateHomepageUI'])->name('updateHomepageUI');
    Route::Post('/categories',[UiSettingController::class, 'updateCategoriesUI'])->name('updateCategoriesUI');
    Route::Post('/products',[UiSettingController::class, 'updateProductsUI'])->name('updateProductsUI');
    Route::Post('/email',[UiSettingController::class, 'updateEmailUI'])->name('updateEmailUI');
    Route::Post('/marketing',[UiSettingController::class, 'updateMarketingUI'])->name('updateMarketingUI');
    Route::post('/category-products', [UiSettingController::class, 'updateCategoryProducts'])->name('updateCategoryProducts');
});

Route::middleware(['auth', 'verified', 'permission:view.settings'])->prefix('admin/settings/general')->name('admin.general-settings.')->group(function () {
    Route::get('/', [GeneralSettingController::class, 'index'])->name('index');
});

Route::middleware(['auth', 'verified', 'permission:edit.settings'])->prefix('admin/settings/general')->name('admin.general-settings.update.')->group(function () {
    Route::post('/system', [GeneralSettingController::class, 'updateSystem'])->name('updateSystem');
    Route::post('/contact', [GeneralSettingController::class, 'updateContact'])->name('updateContact');
    Route::post('/seo', [GeneralSettingController::class, 'updateSeo'])->name('updateSeo');
    Route::post('/auth', [GeneralSettingController::class, 'updateAuth'])->name('updateAuth');
    Route::post('/ecommerce', [GeneralSettingController::class, 'updateEcommerce'])->name('updateEcommerce');
    Route::post('/email', [GeneralSettingController::class, 'updateEmail'])->name('updateEmail');
    Route::post('/security', [GeneralSettingController::class, 'updateSecurity'])->name('updateSecurity');
    Route::post('/integrations', [GeneralSettingController::class, 'updateIntegrations'])->name('updateIntegrations');
    Route::post('/legal', [GeneralSettingController::class, 'updateLegal'])->name('updateLegal');
    Route::post('/advanced', [GeneralSettingController::class, 'updateAdvanced'])->name('updateAdvanced');
});

Route::middleware(['auth', 'verified', 'permission:view.settings'])->prefix('admin/settings/business')->name('admin.business-settings.')->group(function () {
    Route::get('/', [BusinessSettingController::class, 'index'])->name('index');
});

Route::middleware(['auth', 'verified', 'permission:edit.settings'])->prefix('admin/settings/business')->name('admin.business-settings.update.')->group(function () {
    Route::post('/payments', [BusinessSettingController::class, 'updatePayments'])->name('updatePayments');
    Route::post('/currency', [BusinessSettingController::class, 'updateCurrency'])->name('updateCurrency');
    Route::post('/shipping', [BusinessSettingController::class, 'updateShipping'])->name('updateShipping');
    Route::post('/vendor', [BusinessSettingController::class, 'updateVendor'])->name('updateVendor');
    Route::post('/faqs', [BusinessSettingController::class, 'updateFaqs'])->name('updateFaqs');
    Route::post('/gateways', [BusinessSettingController::class, 'updateGateways'])->name('updateGateways');
    Route::post('/advanced', [BusinessSettingController::class, 'updateAdvanced'])->name('updateAdvanced');
});


// Temporary Routes
Route::get('/index', [FrontendController::class, 'index'])->name('frontend.home');

// 1. All Products (localhost:8000/frontend/products)
Route::get('/frontend/products', [FrontendController::class, 'products'])
    ->name('frontend.products');

// 2. Single Product (localhost:8000/frontend/products/slug)
Route::get('/frontend/products/{slug}', [FrontendController::class, 'productDetail'])
    ->name('frontend.product.detail');