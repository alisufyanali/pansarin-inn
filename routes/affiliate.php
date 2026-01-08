<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Vendor\AffiliateController;
use App\Http\Controllers\Vendor\PayoutController;
use App\Http\Controllers\Admin\AffiliateController as AdminAffiliate;

Route::middleware(['auth', 'verified'])->group(function () {

    // --- Vendor/Affiliate Side ---
    Route::prefix('dashboard/affiliate')->group(function () {
        Route::get('/', [AffiliateController::class, 'index'])->name('affiliate.dashboard');
        Route::get('/register', function() { return inertia('Affiliate/Registration'); })->name('affiliate.register.view');
        Route::post('/register', [AffiliateController::class, 'store'])->name('affiliate.store');
        Route::get('/referrals', [AffiliateController::class, 'referrals'])->name('affiliate.referrals');
        Route::get('/payouts', [PayoutController::class, 'index'])->name('affiliate.payouts');
        Route::post('/payout-request', [PayoutController::class, 'store'])->name('affiliate.payout.store');
    });

    // --- Admin Side ---
    Route::prefix('admin/affiliate')->group(function () {
        Route::get('/manager', [AdminAffiliate::class, 'index'])->name('admin.affiliate.index');
        Route::get('/logs', [AdminAffiliate::class, 'logs'])->name('admin.affiliate.logs');
        Route::get('/payouts', [AdminAffiliate::class, 'payoutRequests'])->name('admin.affiliate.payouts');
        Route::post('/payouts/{id}/approve', [AdminAffiliate::class, 'approvePayout'])->name('admin.affiliate.payout.approve');
    });

    Route::get('/settings', [AdminAffiliate::class, 'settings'])->name('admin.affiliate.settings');
    Route::post('/settings', [AdminAffiliate::class, 'updateSettings'])->name('admin.affiliate.settings.update');

});
