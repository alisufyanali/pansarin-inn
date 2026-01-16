<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\Frontend\GeneralSettingController;
use App\Http\Controllers\Admin\Frontend\UiSettingController;
use App\Http\Controllers\Admin\Frontend\BusinessSettingController;
use App\Http\Controllers\Admin\Frontend\PageController;

/*
|--------------------------------------------------------------------------
| Admin Frontend Settings Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin/frontend')->group(function () {
    
    // Settings Routes (Mostly using index and store/update)
    Route::apiResource('general-settings', GeneralSettingController::class);
    Route::apiResource('ui-settings', UiSettingController::class);
    Route::apiResource('business-settings', BusinessSettingController::class);
    
    // Custom Pages Routes (Full CRUD)
    Route::apiResource('pages', PageController::class);
    
});