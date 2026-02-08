<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;


Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');


Route::get('/clear-cache', function () {
    try {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');
        return 'cache cleared successfully';
    } catch (\Exception $e){
        return 'Error Clearing cache: ' . $e->getMessage();
    }
});

Route::match(['get', 'post'], '/whatsapp/webhook', [WhatsAppController::class, 'webhook'])->name('whatsapp.webhook');


require __DIR__.'/frontend.php';
require __DIR__.'/admin.php';
require __DIR__.'/affiliate.php';
require __DIR__.'/settings.php';
