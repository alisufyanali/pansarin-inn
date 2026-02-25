<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Affiliate\MarketingController;
use App\Http\Controllers\Affiliate\AffiliateController;
use App\Http\Controllers\Affiliate\PayoutController;
use App\Http\Controllers\Admin\AffiliateController as AdminAffiliate;

// URL: domain.com/affiliates/...
Route::middleware(['auth', 'verified'])->prefix('affiliates')->group(function () {
    
    // Dashboard -> /affiliates/dashboard
    Route::get('/dashboard', [AffiliateController::class, 'index'])->name('affiliate.dashboard');
    
    // Registration
    Route::get('/registration', function() { 
        return Inertia::render('Affiliates/Registration'); 
    })->name('affiliate.register.view');
    
    Route::post('/register', [AffiliateController::class, 'store'])->name('affiliate.store');
    
    // Referrals -> /affiliates/referral
    Route::get('/referral', [AffiliateController::class, 'referrals'])->name('affiliate.referrals');
    
    // Payouts
    Route::get('/payouts', [PayoutController::class, 'index'])->name('affiliate.payouts');
    Route::post('/payout-request', [PayoutController::class, 'store'])->name('affiliate.payout.store');

    Route::get('/products', [MarketingController::class, 'productCatalog'])->name('products.index');
});

// --- Admin Side Affiliate Management ---
// URL: domain.com/admin/affiliates/...
Route::middleware(['auth'])->prefix('admin/affiliates')->group(function () {
    
    Route::get('/', [AdminAffiliate::class, 'index'])->name('admin.affiliate.index');
    Route::get('/payouts', [AdminAffiliate::class, 'payoutRequests'])->name('admin.affiliate.payouts');
    Route::post('/payouts/{id}/approve', [AdminAffiliate::class, 'approvePayout'])->name('admin.affiliate.payout.approve');
    Route::get('/logs', [AdminAffiliate::class, 'logs'])->name('admin.affiliate.logs');
    Route::get('/settings', [AdminAffiliate::class, 'settings'])->name('admin.affiliate.settings');
    Route::post('/settings', [AdminAffiliate::class, 'updateSettings'])->name('admin.affiliate.settings.update');
});