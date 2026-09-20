<?php

use App\Http\Middleware\EnsurePasswordChanged;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\TrackAffiliate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Exclude WhatsApp webhook from CSRF — incoming POSTs come from Meta's servers
        $middleware->validateCsrfTokens(except: [
            '/whatsapp/webhook',
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class,
        ]);

        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
            SecurityHeaders::class,
        ]);

        $middleware->alias([
            'password.changed' => EnsurePasswordChanged::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // ── Inertia 403 rendering ─────────────────────────────────
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 403 && $request->header('X-Inertia')) {
                return \Inertia\Inertia::render('errors/403')
                    ->toResponse($request)
                    ->setStatusCode(403);
            }
            if ($e->getStatusCode() === 403) {
                return \Inertia\Inertia::render('errors/403')
                    ->toResponse($request)
                    ->setStatusCode(403);
            }
        });
        $exceptions->render(function (\Spatie\Permission\Exceptions\UnauthorizedException $e, $request) {
            if ($request->header('X-Inertia')) {
                return \Inertia\Inertia::render('errors/403')
                    ->toResponse($request)
                    ->setStatusCode(403);
            }
            return \Inertia\Inertia::render('errors/403')
                ->toResponse($request)
                ->setStatusCode(403);
        });

        // ── API generic exception shield ──────────────────────────
        // Catches any unhandled exception on API requests and returns a
        // safe generic JSON response. Never leaks exception messages when
        // APP_DEBUG=false. Full detail is always written to laravel.log.
        //
        // Excluded (Laravel handles these correctly itself):
        //   ValidationException        → 422 with field errors
        //   AuthenticationException    → 401
        //   AuthorizationException     → 403
        //   ModelNotFoundException     → 404
        //   HttpException              → uses its own status code (404, 405, …)
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            // Only intercept API / JSON-expecting requests
            if (! ($request->expectsJson() || $request->is('api/*'))) {
                return null; // let the default web handler take over
            }

            // Pass well-typed exceptions back to Laravel's own renderers
            $passThrough = [
                \Illuminate\Validation\ValidationException::class,
                \Illuminate\Auth\AuthenticationException::class,
                \Illuminate\Auth\Access\AuthorizationException::class,
                \Illuminate\Database\Eloquent\ModelNotFoundException::class,
                \Symfony\Component\HttpKernel\Exception\HttpException::class,
            ];
            foreach ($passThrough as $class) {
                if ($e instanceof $class) {
                    return null;
                }
            }

            // Log the full exception regardless of APP_DEBUG
            \Illuminate\Support\Facades\Log::error('Unhandled API exception: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong. Please try again or contact support.',
            ], 500);
        });
    })->create();