<?php
use App\Http\Controllers\Admin\Settings\GeneralSettingController;
use App\Http\Controllers\Admin\Settings\UiSettingController;
use App\Http\Controllers\Admin\Settings\BusinessSettingController;
use App\Http\Controllers\Admin\PageController;

use App\Http\Controllers\Api\FrontendController;
use Illuminate\Support\Facades\Route;

Route::get('/index', [FrontendController::class, 'index']);

// Route::middleware(['auth'])->prefix('admin/pages')->name('admin.')->group(function () {
//     Route::resource('business-settings', BusinessSettingController::class)->only(['index', 'store']);
//     Route::resource('pages', PageController::class);
//     Route::get('admin/pages-data', [PageController::class, 'getPagesData'])->name('admin.pages.data');
// });

Route::middleware(['auth'])->prefix('admin/settings/ui')->name('admin.ui-settings.')->group(function () {
    Route::get('/', [UiSettingController::class, 'index'])->name('index');
    Route::Post('/branding', [UiSettingController::class, 'updateBrandingUI'])->name('updateBrandingUI');
    Route::Post('/header', [UiSettingController::class, 'updateHeaderUI'])->name('updateHeaderUI');
    Route::Post('/homepage', [UiSettingController::class, 'updateHomepageUI'])->name('updateHomepageUI');
    Route::Post('/categories', [UiSettingController::class, 'updateCategoriesUI'])->name('updateCategoriesUI');
    Route::Post('/products', [UiSettingController::class, 'updateProductsUI'])->name('updateProductsUI');
    Route::Post('/email', [UiSettingController::class, 'updateEmailUI'])->name('updateEmailUI');
    Route::Post('/marketing', [UiSettingController::class, 'updateMarketingUI'])->name('updateMarketingUI');

});

Route::middleware(['auth'])->prefix('admin/settings/general')->name('admin.general-settings.')->group(function () {
    Route::get('/', [GeneralSettingController::class, 'index'])->name('index');
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

Route::middleware(['auth'])->prefix('admin/settings/business')->name('admin.business-settings.')->group(function () {
    Route::get('/', [BusinessSettingController::class, 'index'])->name('index');
    Route::post('/payments', [BusinessSettingController::class, 'updatePayments'])->name('updatePayments');
    Route::post('/currency', [BusinessSettingController::class, 'updateCurrency'])->name('updateCurrency');
    Route::post('/shipping', [BusinessSettingController::class, 'updateShipping'])->name('updateShipping');
    Route::post('/vendor', [BusinessSettingController::class, 'updateVendor'])->name('updateVendor');
    Route::post('/faqs', [BusinessSettingController::class, 'updateFaqs'])->name('updateFaqs');
    Route::post('/gateways', [BusinessSettingController::class, 'updateGateways'])->name('updateGateways');
    Route::post('/advanced', [BusinessSettingController::class, 'updateAdvanced'])->name('updateAdvanced');
});
