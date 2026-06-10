<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use App\Models\Affiliate;
use App\Models\AffiliateClick;
use App\Models\AffiliateSetting;

class TrackAffiliate
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->has('ref')) {
            cookie()->queue('affiliate_ref', $request->query('ref'), 60 * 24 * 30);
        }

        return $next($request);
    }
}