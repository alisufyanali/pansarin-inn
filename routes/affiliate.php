<?php

// use App\Http\Controllers\Affiliate\MarketingController;
// use App\Http\Controllers\Affiliate\AffiliateController;
// use App\Http\Controllers\Affiliate\PayoutController;
use App\Http\Controllers\Admin\AffiliateController as AdminAffiliate;

// // URL: domain.com/affiliates/...
// Route::middleware(['auth', 'verified'])->prefix('affiliates')->group(function () {
    
//     // Dashboard -> /affiliates/dashboard
//     Route::get('/dashboard', [AffiliateController::class, 'index'])->name('affiliate.dashboard');
    
//     // Registration
//     Route::get('/registration', function() { 
//         return Inertia::render('Affiliates/Registration'); 
//     })->name('affiliate.register.view');
    
//     Route::post('/register', [AffiliateController::class, 'store'])->name('affiliate.store');
    
//     // Referrals -> /affiliates/referral
//     Route::get('/referral', [AffiliateController::class, 'referrals'])->name('affiliate.referrals');
    
//     // Payouts
//     Route::get('/payouts', [PayoutController::class, 'index'])->name('affiliate.payouts');
//     Route::post('/payout-request', [PayoutController::class, 'store'])->name('affiliate.payout.store');

//     Route::get('/products', [MarketingController::class, 'productCatalog'])->name('products.index');
// });

// // --- Admin Side Affiliate Management ---
// // URL: domain.com/admin/affiliates/...
Route::middleware(['auth'])->prefix('admin/affiliates')->group(function () {
    
    Route::get('/aaa', [AdminAffiliate::class, 'index'])->name('admin.affiliate.index');
    Route::get('/payouts', [AdminAffiliate::class, 'payoutRequests'])->name('admin.affiliate.payouts');
    Route::post('/payouts/{id}/approve', [AdminAffiliate::class, 'approvePayout'])->name('admin.affiliate.payout.approve');
    // Route::get('/logs', [AdminAffiliate::class, 'logs'])->name('admin.affiliate.logs');
    Route::get('/settings', [AdminAffiliate::class, 'settings'])->name('admin.affiliate.settings');
    Route::post('/settings', [AdminAffiliate::class, 'updateSettings'])->name('admin.affiliate.settings.update');
});

use App\Http\Controllers\Admin\AdminAffiliateController;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/affiliates', [AdminAffiliateController::class, 'index'])->name('admin.affiliates.index');
    Route::patch('/affiliate/status/{id}', [AdminAffiliateController::class, 'updateStatus'])->name('admin.affiliate.updateStatus');
    
    Route::get('/logs', [AdminAffiliateController::class, 'referralLogs'])->name('admin.affiliate.logs');
});




use App\Http\Controllers\Affiliate\AffiliateController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Affiliate Dashboard (Protected)
Route::middleware(['auth', 'role:affiliate'])->group(function () {
    Route::get('/affiliate/dashboard', [AffiliateController::class, 'dashboard'])
    ->name('affiliate.dashboard');
});


// Referral Registration: localhost:8000/register-affiliate?ref=CODE123 (Public)
Route::get('/register-affiliate', [AffiliateController::class, 'showRegisterForm'])
    ->name('affiliate.customer.register');

Route::post('/affiliate/register-customer', [AffiliateController::class, 'registerCustomer'])
    ->name('affiliate.customer.store');   

    // Sign User Registration
Route::get('/affiliate/join', function() {return Inertia::render('Affiliate/RegisterAffiliate');})
    ->name('affiliate.join.page');

Route::post('/affiliate/join', [AffiliateController::class, 'joinAffiliate'])
    ->name('affiliate.join.submit');

// Single Referral Details
Route::get('/affiliate/referral/{id}', [AffiliateController::class, 'showReferralDetails'])
->name('affiliate.referral.details');

// productsCatelog
Route::get('/affiliate/products', [AffiliateController::class, 'productCatalog'])
    ->name('affiliate.products');