<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\Referral;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cookie;

class AffiliateController extends Controller
{
    public function index()
    {
        $affiliate = auth()->user()->affiliate;
        
        if (!$affiliate) {
            // Registration.tsx file ka sahi path
            return Inertia::render('Affiliate/Registration');
        }

        return Inertia::render('Affiliate/Dashboard', [ // Dashboard.tsx
            'stats' => [
                'balance' => $affiliate->balance,
                'total_referrals' => $affiliate->referrals()->count(),
                'pending_commissions' => $affiliate->referrals()->where('status', 'pending')->sum('commission_amount'),
                'affiliate_code' => $affiliate->affiliate_code,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->affiliate) {
            return redirect()->route('affiliate.dashboard')->with('error', 'You are already an affiliate.');
        }

        $parentAffiliateId = null;
        $cookieCode = Cookie::get('affiliate_referral');
        if ($cookieCode) {
            $parent = Affiliate::where('affiliate_code', $cookieCode)->first();
            $parentAffiliateId = $parent ? $parent->id : null;
        }

        Affiliate::create([
            'user_id' => $user->id,
            'affiliate_code' => Str::upper(Str::random(8)),
            'commission_rate' => 5.00,
            'status' => 1,
            'parent_id' => $parentAffiliateId
        ]);

        $user->update(['role' => 'affiliate']);

        return redirect()->route('affiliate.dashboard')->with('success', 'Affiliate account created');
    }

    public function referrals()
{
    $affiliate = auth()->user()->affiliate;

    // Safety Check: Agar user affiliate nahi hai toh referrals page nahi dikha sakte
    if (!$affiliate) {
        return redirect()->route('affiliate.register.view')
            ->with('error', 'Please register as an affiliate first.');
    }

    $referrals = $affiliate->referrals()->with('order')->latest()->get();
    
    return Inertia::render('Affiliate/Referrals', [
        'referrals' => $referrals
    ]);
}
}