<?php

use App\Http\Controllers\Admin\WhatsAppController;
use App\Http\Middleware\TrackAffiliate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Public storefront routes — TrackAffiliate runs here so ?ref= cookies are set
// for visitors landing on the homepage or any public page via an affiliate link.
Route::middleware([TrackAffiliate::class])->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    })->name('home');

    Route::get('/privacy_policy', function () {
        return '<h1>Privacy Policy</h1><p>This app uses WhatsApp Business API to receive and respond to messages. We do not collect or store any personal information except the WhatsApp message content necessary for service functionality.</p>';
    })->name('privacy_policy');
});

Route::match(['get', 'post'], '/whatsapp/webhook', [WhatsAppController::class, 'webhook'])->middleware('throttle:30,1')->name('whatsapp.webhook');

// Maintenance helpers — staff with the `run-maintenance` permission only (seeded in RolePermissionSeeder)
Route::middleware(['auth', 'staff', 'permission:run-maintenance'])->group(function () {
    Route::get('/clear-cache', function () {
        try {
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');

            return 'cache cleared successfully';
        } catch (\Exception $e) {
            return 'Error Clearing cache: '.$e->getMessage();
        }
    });

    // Temporary routes — always remove in production!
    Route::get('/run-build-clear', function () {
        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('view:clear');
        Artisan::call('route:clear');
        Artisan::call('optimize:clear');

        return 'Cache cleared successfully! ✅<br><br>'.
               'Now, on your local machine:<br>'.
               '1. Run npm run build<br>'.
               '2. Upload the public/build folder to cPanel<br>'.
               '3. Delete the public/hot file (if it exists)<br>'.
               '4. Clear the browser cache (Ctrl+Shift+Delete)';
    });

    // Deletes the hot file
    Route::get('/remove-hot-file', function () {
        $hotFile = public_path('hot');

        if (file_exists($hotFile)) {
            unlink($hotFile);

            return 'Hot file deleted successfully! ✅<br>Now clear the browser cache and refresh the page.';
        }

        return 'Hot file already deleted! ✅';
    });

    // Checks the build files
    Route::get('/check-build', function () {
        $manifestPath = public_path('build/manifest.json');
        $hotPath = public_path('hot');

        $output = '<h2>Build Status Check:</h2>';
        $output .= '<strong>1. Manifest file:</strong> '.(file_exists($manifestPath) ? '✅ EXISTS' : '❌ NOT FOUND').'<br>';
        $output .= '<strong>2. Hot file:</strong> '.(file_exists($hotPath) ? '❌ EXISTS (DELETE IT!)' : '✅ DELETED').'<br>';
        $output .= '<strong>3. APP_ENV:</strong> '.config('app.env').'<br>';
        $output .= '<strong>4. APP_DEBUG:</strong> '.(config('app.debug') ? 'true' : 'false').'<br>';

        if (file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            $output .= '<br><strong>Build files found:</strong><br>';
            $output .= '<pre>'.print_r(array_keys($manifest), true).'</pre>';
        }

        return $output;
    });
});

require __DIR__.'/admin.php';
require __DIR__.'/frontend.php';
require __DIR__.'/affiliate.php';
require __DIR__.'/settings.php';
require __DIR__.'/test.php';
