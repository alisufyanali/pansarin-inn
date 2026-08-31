<?php

namespace App\Providers;

use App\Models\Order;
use App\Observers\OrderObserver;
use App\Services\WhatsAppService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
// Spatie middlewares (alias registration)
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
        $this->app->singleton(WhatsAppService::class, function ($app) {
            return new WhatsAppService;
        });

    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers
        Order::observe(OrderObserver::class);

        // Strong password policy — applies wherever Password::defaults() is used
        Password::defaults(function () {
            return Password::min(8)->mixedCase()->numbers()->symbols();
        });

        // ── API rate limiters ──────────────────────────────────────────────
        //
        // "api.public" — used by the public 60-req/min route group.
        //
        // Build-server bypass: if the request carries a valid X-Build-Token
        // header matching BUILD_API_TOKEN in .env, the limit is raised to
        // 1000 req/min (enough headroom for Next.js static generation).
        // If BUILD_API_TOKEN is empty/unset the bypass is never reachable.
        //
        // All other requests are limited to 60 req/min keyed by IP, matching
        // the previous throttle:60,1 inline middleware behaviour.
        RateLimiter::for('api.public', function (Request $request) {
            $buildToken = config('app.build_api_token'); // set via BUILD_API_TOKEN in .env

            if (
                $buildToken
                && $request->header('X-Build-Token') === $buildToken
            ) {
                return Limit::perMinute(1000)->by('build-server');
            }

            return Limit::perMinute(60)->by($request->ip());
        });

        // Register Spatie permission middleware aliases so controllers can use 'permission' and 'role'
        $router = $this->app->make(Router::class);
        $router->aliasMiddleware('permission', PermissionMiddleware::class);
        $router->aliasMiddleware('role', RoleMiddleware::class);
        Inertia::share([
            'flash' => fn () => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);

    }
}
