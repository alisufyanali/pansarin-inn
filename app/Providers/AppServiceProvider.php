<?php

namespace App\Providers;

use App\Services\WhatsAppService;
use Illuminate\Routing\Router;
// Spatie middlewares (alias registration)
use Illuminate\Support\ServiceProvider;
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
