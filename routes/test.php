<?php

// Test/seeder routes are only available in local development.
// This guard prevents them from being registered in production,
// staging, or any other environment.
if (! app()->environment('local')) {
    return;
}

use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;


// 1. Is URL se aapka Page open hoga (GET)
Route::get('/test/dashboard', [TestController::class, 'index'])->name('test.index');

// 2. Is URL par sirf Button click hone se Request jayegi (POST)
Route::post('/test/run-seeder', [TestController::class, 'runTestSeeder'])->name('test.run-seeder');
Route::post('/test/clear-cache', [TestController::class, 'clearCache'])->name('test.clear-cache');

Route::post('/test/place-order', [TestController::class, 'placeTestOrder'])->name('test.place-order');
Route::post('/test/deliver-order', [TestController::class, 'deliverTestOrder'])->name('test.deliver-order');