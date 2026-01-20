<?php
use App\Http\Controllers\Admin\Frontend\GeneralSettingController;
use App\Http\Controllers\Admin\Frontend\UiSettingController;
use App\Http\Controllers\Admin\Frontend\BusinessSettingController;
use App\Http\Controllers\Admin\Frontend\PageController;

// Route::middleware(['web', 'auth'])->prefix('admin/frontend')->name('admin.')->group(function () {
//     Route::resource('business-settings', BusinessSettingController::class)->only(['index', 'store']);
//     Route::resource('pages', PageController::class);
//     Route::get('admin/pages-data', [PageController::class, 'getPagesData'])->name('admin.pages.data');
// });

// Admin Protected Routes
Route::middleware(['auth'])->prefix('admin/ui')->name('admin.')->group(function () {
    Route::prefix('settings/ui')->name('ui-settings.')->group(function () {
        Route::get('/', [UiSettingController::class, 'index'])->name('index');
        Route::post('/store', [UiSettingController::class, 'store'])->name('store');
    });
});

Route::middleware(['auth'])->prefix('admin/general')->name('admin.general-settings.')->group(function () {
    Route::get('/', [GeneralSettingController::class, 'index'])->name('index');
    Route::post('/update-system', [GeneralSettingController::class, 'updateSystem'])->name('updateSystem');
    Route::post('/update-contact', [GeneralSettingController::class, 'updateContact'])->name('updateContact');
    Route::post('/update-seo', [GeneralSettingController::class, 'updateSeo'])->name('updateSeo');
    Route::post('/update-auth', [GeneralSettingController::class, 'updateAuth'])->name('updateAuth');
    Route::post('/update-ecommerce', [GeneralSettingController::class, 'updateEcommerce'])->name('updateEcommerce');
    Route::post('/update-email', [GeneralSettingController::class, 'updateEmail'])->name('updateEmail');
    Route::post('/update-security', [GeneralSettingController::class, 'updateSecurity'])->name('updateSecurity');
    Route::post('/update-integrations', [GeneralSettingController::class, 'updateIntegrations'])->name('updateIntegrations');
    Route::post('/update-legal', [GeneralSettingController::class, 'updateLegal'])->name('updateLegal');
    Route::post('/update-advanced', [GeneralSettingController::class, 'updateAdvanced'])->name('updateAdvanced');
});

Route::middleware(['auth'])->prefix('admin/business')->name('admin.business-settings.')->group(function () {
    Route::get('/', [BusinessSettingController::class, 'index'])->name('index');
    Route::post('/payments', [BusinessSettingController::class, 'updatePayments'])->name('updatePayments');
    Route::post('/currency', [BusinessSettingController::class, 'updateCurrency'])->name('updateCurrency');
    Route::post('/shipping', [BusinessSettingController::class, 'updateShipping'])->name('updateShipping');
    Route::post('/vendor', [BusinessSettingController::class, 'updateVendor'])->name('updateVendor');
    Route::post('/faqs', [BusinessSettingController::class, 'updateFaqs'])->name('updateFaqs');
    Route::post('/gateways', [BusinessSettingController::class, 'updateGateways'])->name('updateGateways');
    Route::post('/advanced', [BusinessSettingController::class, 'updateAdvanced'])->name('updateAdvanced');
});