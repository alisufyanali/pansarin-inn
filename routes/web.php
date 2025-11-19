<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Admin\RoleController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // User Management resources Controllers
    Route::resource('users', UserController::class);

    // Role Management resources Controllers
    Route::resource('roles', \App\Http\Controllers\Admin\RoleController::class);
});

require __DIR__.'/settings.php';
