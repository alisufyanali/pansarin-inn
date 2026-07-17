<?php

namespace App\Providers;

use App\Models\Order;
use App\Observers\OrderObserver;
use App\Services\WhatsAppService;
use Illuminate\Routing\Router;
// Spatie middlewares (alias registration)
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
