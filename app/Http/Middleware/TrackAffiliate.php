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
        // Agar pehle se affiliate cookie lagi hui hai to overwrite na karein
        if (!$request->has('ref') || Cookie::has('affiliate_referral')) {
            return $next($request);
        }

        $code = $request->query('ref');

        $affiliate = Affiliate::where('affiliate_code', $code)
            ->where('status', 1)
            ->first();

        if (!$affiliate) {
            return $next($request);
        }

        //  Self-referral block
        if (auth()->check() && auth()->id() === $affiliate->user_id) {
            return $next($request);
        }

        // Cookie expiry (admin configurable)
        $days = AffiliateSetting::where('key', 'cookie_expiry_days')->value('value') ?? 30;
        Cookie::queue('affiliate_referral', $code, $days * 1440);

        // Click tracking (once per day per IP + UserAgent)
        $alreadyClicked = AffiliateClick::where('affiliate_id', $affiliate->id)
            ->where('ip_address', $request->ip())
            ->where('user_agent', $request->userAgent())
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

        return $next($request);
    }
}
