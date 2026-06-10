<?php

use App\Http\Controllers\Affiliate\PayoutController;
use App\Http\Controllers\Admin\AffiliateController as AdminAffiliate;
use App\Http\Controllers\Admin\AdminAffiliateController;
use App\Http\Controllers\Affiliate\AffiliateController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes (Dummy pages)
|--------------------------------------------------------------------------
*/
// Referral Registration: e.g., pansariinn.pk/register-affiliate?ref=CODE123
Route::get('/register-affiliate', [AffiliateController::class, 'showRegisterForm'])->name('affiliate.customer.register');
Route::post('/affiliate/register-customer', [AffiliateController::class, 'registerCustomer'])->name('affiliate.customer.store');


/*
|--------------------------------------------------------------------------
| Protected Affiliate Routes (Auth & Role: Affiliate)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:affiliate'])->prefix('affiliate')->name('affiliate.')->group(function () {
    
    // Dashboard & Public Page Joining
    Route::get('/dashboard', [AffiliateController::class, 'dashboard'])->name('dashboard');
    Route::get('/join', function() { return Inertia::render('Affiliate/RegisterAffiliate'); })->name('join.page');
    Route::post('/join', [AffiliateController::class, 'joinAffiliate'])->name('join.submit');
    
    // Referral Data
    Route::get('/referral/{id}', [AffiliateController::class, 'showReferralDetails'])->name('referral.details');
    Route::get('/products', [AffiliateController::class, 'productCatalog'])->name('products');

    // Payouts & Payment Methods
    Route::get('/payouts', [PayoutController::class, 'index'])->name('payouts.index');
    Route::post('/payouts/request', [PayoutController::class, 'store'])->name('payouts.request');
    Route::post('/payment-methods', [PayoutController::class, 'storePaymentMethod'])->name('payment-methods.store');
    Route::delete('/payment-methods/{id}', [PayoutController::class, 'destroyPaymentMethod'])->name('payment-methods.destroy');
});


/*
|--------------------------------------------------------------------------
| Protected Admin Routes (Auth, Verified & Role: Admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Core Admin Affiliate Management
    Route::get('/affiliates', [AdminAffiliateController::class, 'index'])->name('affiliates.index');
    Route::patch('/affiliate/status/{id}', [AdminAffiliateController::class, 'updateStatus'])->name('affiliate.updateStatus');
    Route::get('/logs', [AdminAffiliateController::class, 'referralLogs'])->name('affiliate.logs');

    // Nested Nested Routes for Admin -> Affiliates (Settings & Payouts)
    Route::prefix('affiliates')->group(function () {
        Route::get('/aaa', [AdminAffiliate::class, 'index'])->name('affiliate.index');
        Route::get('/settings', [AdminAffiliate::class, 'settings'])->name('affiliate.settings');
        Route::post('/settings', [AdminAffiliate::class, 'updateSettings'])->name('affiliate.settings.update');

        // Payouts Management
        Route::get('/payouts', [AdminAffiliateController::class, 'index'])->name('affiliate.payout.index'); // Fallback redirect
        Route::get('/payouts-list', [App\Http\Controllers\Admin\Affiliate\PayoutController::class, 'index'])->name('affiliate.payouts'); 
        Route::post('/payouts/{id}/approve', [App\Http\Controllers\Admin\Affiliate\PayoutController::class, 'approve'])->name('affiliate.payout.approve');
        Route::post('/payouts/{id}/reject', [App\Http\Controllers\Admin\Affiliate\PayoutController::class, 'reject'])->name('affiliate.payout.reject');
    });
});