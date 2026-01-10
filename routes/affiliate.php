<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Vendor\AffiliateController;
use App\Http\Controllers\Vendor\PayoutController;
use App\Http\Controllers\Admin\AffiliateController as AdminAffiliate;

Route::middleware(['auth', 'verified'])->group(function () {

    Route::middleware(['auth', 'verified'])->prefix('affiliates')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [AffiliateController::class, 'index'])->name('affiliate.dashboard');
    
    // Registration View
    Route::get('/registration', function() { 
        return Inertia::render('Affiliate/Registration'); 
    })->name('affiliate.register.view');
    
    // Registration Action
    Route::post('/register', [AffiliateController::class, 'store'])->name('affiliate.store');
    
    // Referrals
    Route::get('/referral', [AffiliateController::class, 'referrals'])->name('affiliate.referrals');
    
    // Payouts
    Route::get('/payouts', [PayoutController::class, 'index'])->name('affiliate.payouts');
    Route::post('/payout-request', [PayoutController::class, 'store'])->name('affiliate.payout.store');
});

    // --- Admin Side Affiliate Management ---
// Maine prefix ko 'admin/affiliates' kar diya hai taake Sidebar se match ho
Route::prefix('admin/affiliates')->group(function () {
    
    // URL: /admin/affiliates
    Route::get('/', [AdminAffiliate::class, 'index'])->name('admin.affiliate.index');

    // URL: /admin/affiliates/payouts
    Route::get('/payouts', [AdminAffiliate::class, 'payoutRequests'])->name('admin.affiliate.payouts');
    Route::post('/payouts/{id}/approve', [AdminAffiliate::class, 'approvePayout'])->name('admin.affiliate.payout.approve');

    // URL: /admin/affiliates/logs
    Route::get('/logs', [AdminAffiliate::class, 'logs'])->name('admin.affiliate.logs');

    // URL: /admin/affiliates/settings (Isay group ke andar le aaya hoon)
    Route::get('/settings', [AdminAffiliate::class, 'settings'])->name('admin.affiliate.settings');
    Route::post('/settings', [AdminAffiliate::class, 'updateSettings'])->name('admin.affiliate.settings.update');
});

});
