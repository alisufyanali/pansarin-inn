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
    public function handle(Request $request, Closure $next) {
        if (!$request->has('ref')) {
            return $next($request);
        }

        $refCode = $request->query('ref'); // Code as string (e.g., ABC12345)

        $affiliate = Affiliate::where('affiliate_code', $refCode)
            ->where('status', 'active')
            ->first();

        if ($affiliate) {
            // Cookie duration from settings
            $days = AffiliateSetting::where('key', 'cookie_duration')->value('value') ?? 30;
            
            // Save Affiliate CODE in cookie, not User ID
            Cookie::queue('affiliate_referral', $affiliate->affiliate_code, $days * 1440);

            $this->logClick($affiliate, $request);
        }

        return $next($request);
    }

    protected function logClick($affiliate, $request)  {
        $alreadyClicked = AffiliateClick::where('affiliate_id', $affiliate->id)
            ->where('ip_address', $request->ip())
            ->whereDate('created_at', now()->today())
            ->exists();

        if (!$alreadyClicked) {
            AffiliateClick::create([
                'affiliate_id' => $affiliate->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'referring_url' => $request->headers->get('referer'),
                ]);
            }
    }
}
