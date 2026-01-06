<?php



// // Admin side management
//     Route::prefix('admin')->group(function () {
//         Route::resource('affiliates', App\Http\Controllers\Admin\AffiliateController::class);
// });

//     // Affiliate/Vendor side dashboard
//     Route::prefix('vendor')->group(function () {
//         Route::resource('affiliate', App\Http\Controllers\Vendor\AffiliateController::class);
//         Route::resource('payouts', App\Http\Controllers\Vendor\PayoutController::class);
// });

// Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
//     // Affiliates ki list aur status change karne ke liye
//     Route::get('/affiliates', [AdminAffiliateController::class, 'index']);
//     Route::patch('/affiliates/{id}/status', [AdminAffiliateController::class, 'updateStatus']);
    
//     // Payouts approve karne ke liye
//     Route::get('/payouts', [AdminAffiliateController::class, 'payoutRequests']);
//     Route::post('/payouts/{id}/approve', [AdminAffiliateController::class, 'approvePayout']);
// });




use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Vendor\AffiliateController;
use App\Http\Controllers\Vendor\PayoutController;
use App\Http\Controllers\Admin\AffiliateController as AdminAffiliate;

Route::middleware(['auth:sanctum'])->group(function () {
    
    // Affiliate/Vendor Routes
    Route::prefix('vendor/affiliate')->group(function () {
        Route::get('/stats', [AffiliateController::class, 'index']); // Dashboard data
        Route::post('/register', [AffiliateController::class, 'store']); // Join program
        Route::get('/referrals', [AffiliateController::class, 'referrals']); // Sales list
        Route::post('/payout-request', [PayoutController::class, 'store']); // Withdraw
    });

    // Admin Routes
    Route::prefix('admin/affiliate')->group(function () {
        Route::get('/all', [AdminAffiliate::class, 'index']);
        Route::post('/payouts/{id}/approve', [AdminAffiliate::class, 'approvePayout']);
        Route::post('/settings', [AdminAffiliate::class, 'updateSettings']);
    });
});