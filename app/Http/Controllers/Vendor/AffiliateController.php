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
            return Inertia::render('Vendor/Affiliate/Register'); // Agar affiliate nahi hai toh registration page
        }

        return Inertia::render('Vendor/Affiliate/Dashboard', [
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
            return back()->with('error', 'Aap pehle se affiliate hain.');
        }

        // Downline Logic: Cookie se code uthayen aur parent dhonden
        $parentAffiliateId = null;
        $cookieCode = Cookie::get('affiliate_referral');
        if ($cookieCode) {
            $parent = Affiliate::where('affiliate_code', $cookieCode)->first();
            $parentAffiliateId = $parent ? $parent->id : null;
        }

        $affiliate = Affiliate::create([
            'user_id' => $user->id,
            'affiliate_code' => Str::upper(Str::random(8)),
            'commission_rate' => 5.00,
            'status' => 1,
            'parent_id' => $parentAffiliateId
        ]);

        return redirect()->route('vendor.affiliate.index')->with('success', 'Affiliate account ban gaya!');
    }

    public function referrals()
    {
        $referrals = auth()->user()->affiliate->referrals()->with('order')->latest()->get();
        
        return Inertia::render('Vendor/Affiliate/Referrals', [
            'referrals' => $referrals
        ]);
    }
}