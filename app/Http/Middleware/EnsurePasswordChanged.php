<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /**
     * Block any authenticated request where must_change_password is true,
     * except the change-password and logout routes themselves.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user?->must_change_password &&
            ! $request->routeIs('password.change', 'api.logout')
        ) {
            return response()->json([
                'message'              => 'Password change required',
                'must_change_password' => true,
            ], 403);
        }

        return $next($request);
    }
}
