<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The admin panel is for staff only. Customer and affiliate roles carry a few
 * "view.*" permissions for their own data, which the admin controllers would
 * otherwise treat as access to everyone's data.
 */
class EnsureStaff
{
    public const NON_STAFF_ROLES = ['customer', 'affiliate'];

    public static function isStaff($user): bool
    {
        return $user && $user->getRoleNames()->diff(self::NON_STAFF_ROLES)->isNotEmpty();
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! self::isStaff($user)) {
            if ($user?->hasRole('affiliate') && ! $request->expectsJson()) {
                return redirect()->route('affiliate.dashboard');
            }

            abort(403);
        }

        return $next($request);
    }
}
