<?php

namespace App\Http\Controllers\Affiliate;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\Referral;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;

class AffiliateController extends Controller
{
    public function index() {
        // User aur uski affiliate relationship ko load karen
        $user = auth()->user();
        $affiliate = $user->affiliate;
        
        // Agar affiliate nahi hai to Registration page dikhayen
        if (!$affiliate) {
            return Inertia::render('Affiliate/Registration');
        }

        // Agar status 'pending' ya 'blocked' hai to dashboard ke bajaye koi notice dikhana behtar hai
        if ($affiliate->status !== 'active') {
            return Inertia::render('Affiliate/StatusNotice', [
                'status' => $affiliate->status
            ]);
        }

        return Inertia::render('Affiliate/Dashboard', [
            'stats' => [
                'balance' => (float) $affiliate->balance,
                'total_referrals' => $affiliate->referrals()->count(),
                'pending_commissions' => (float) $affiliate->referrals()->where('status', 'pending')->sum('commission_amount'),
                'affiliate_code' => $affiliate->affiliate_code,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        // 1. Check if already an affiliate
        if ($user->affiliate) {
            return redirect()->back()->with('error', 'You are already an affiliate.');
        }

        // 2. Logic for Multi-level (Parent ID)
        $parentAffiliateId = null;
        $cookieCode = Cookie::get('affiliate_referral');
        if ($cookieCode) {
            $parent = Affiliate::where('affiliate_code', $cookieCode)->first();
            // User apna hi parent nahi ban sakta
            if ($parent && $parent->user_id !== $user->id) {
                $parentAffiliateId = $parent->id;
            }
        }

        DB::transaction(function () use ($user, $parentAffiliateId) {
            // 3. Create Affiliate Record
            Affiliate::create([
                'user_id' => $user->id,
                'affiliate_code' => Str::upper(Str::random(8)),
                'commission_rate' => 5.00,
                'status' => 'active', // '1' ki jagah 'active' kyunke migration mein enum hai
                'parent_id' => $parentAffiliateId,
                'balance' => 0.00,
                'joined_at' => now(),
            ]);

            // 4. Correct Spatie Role Assignment
            // $user->update(['role' => 'affiliate']) kaam nahi karega Spatie ke liye
            if (!$user->hasRole('affiliate')) {
                $user->assignRole('affiliate');
            }
        });

        return redirect()->route('affiliate.index')->with('success', 'Affiliate account created successfully!');
    }

    public function referrals()
    {
        $affiliate = auth()->user()->affiliate;

        if (!$affiliate) {
            return redirect()->route('affiliate.index')
                ->with('error', 'Please register as an affiliate first.');
        }

        // Order details ke sath referrals fetch karen
        $referrals = $affiliate->referrals()
            ->with(['order:id,grand_total,status,created_at']) // Order table ke specific columns
            ->latest()
            ->get();
        
        return Inertia::render('Affiliate/Referrals', [
            'referrals' => $referrals
        ]);
    }
}