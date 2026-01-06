<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use App\Models\Affiliate;

class TrackAffiliate
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->has('ref')) {
            $code = $request->query('ref');
            
            // Validate code
            $exists = Affiliate::where('affiliate_code', $code)->where('status', 1)->exists();
            
            if ($exists) {
                // 30 din ke liye cookie save karein (43200 minutes)
                Cookie::queue('affiliate_referral', $code, 43200);
            }
        }

        return $next($request);
    }
}