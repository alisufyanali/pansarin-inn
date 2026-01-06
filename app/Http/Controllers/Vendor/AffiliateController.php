<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\Referral;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AffiliateController extends Controller
{
    // Dashboard Stats
    public function index()
    {
        $affiliate = auth()->user()->affiliate;
        
        if (!$affiliate) {
            return response()->json(['is_affiliate' => false]);
        }

        return response()->json([
            'is_affiliate' => true,
            'stats' => [
                'balance' => $affiliate->balance,
                'total_referrals' => $affiliate->referrals()->count(),
                'pending_commissions' => $affiliate->referrals()->where('status', 'pending')->sum('commission_amount'),
                'affiliate_code' => $affiliate->affiliate_code,
            ]
        ]);
    }

    // Affiliate Registration
    public function store(Request $request)
    {
        $user = auth()->user();
        
        if ($user->affiliate) {
            return response()->json(['message' => 'Aap pehle se affiliate hain.'], 400);
        }

        $affiliate = Affiliate::create([
            'user_id' => $user->id,
            'affiliate_code' => Str::upper(Str::random(8)),
            'commission_rate' => 5.00, // Default 5%
            'status' => 1,
            'parent_id' => $request->cookie('affiliate_referral_id') // Downline logic
        ]);

        return response()->json(['message' => 'Affiliate account ban gaya!', 'data' => $affiliate]);
    }

    public function referrals()
    {
        $referrals = auth()->user()->affiliate->referrals()->with('order')->latest()->get();
        return response()->json($referrals);
    }
}