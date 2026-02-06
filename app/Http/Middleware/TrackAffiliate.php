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
    // Agar URL mein 'ref' nahi hai to aage barhein
    if (!$request->has('ref')) {
        return $next($request);
    }

    $refId = $request->query('ref');

    // Check karein ke ye user_id valid affiliate hai ya nahi
    // Note: Humne yahan user_id use kiya hai kyunke React se ID aa rahi hai
    $affiliate = Affiliate::where('user_id', $refId)
        ->where('status', 1)
        ->first();

    if (!$affiliate) {
        return $next($request);
    }

    // Self-referral block (Apne hi link se khareedne par block)
    if (auth()->check() && auth()->id() == $affiliate->user_id) {
        return $next($request);
    }

    // Cookie expiry days
    $days = AffiliateSetting::where('key', 'cookie_expiry_days')->value('value') ?? 30;
    
    // Cookie update (Last Click Wins logic)
    Cookie::queue('affiliate_referral', $refId, $days * 1440);

    // Click tracking logic (Wahi rahegi jo aapne likhi thi)
    $this->logClick($affiliate, $request);

    return $next($request);
}

// Click logging ko clean karne ke liye separate function
protected function logClick($affiliate, $request) 
{
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
