<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\PayoutRequest;
use App\Models\AffiliateSetting;
use App\Models\Referral;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AffiliateController extends Controller
{
    // 1. Saare Affiliates ki list dikhane ke liye
    public function index()
    {
        $affiliates = Affiliate::with('user')->latest()->get();
        
        return Inertia::render('Admin/Affiliate/AffiliateManager', [
            'affiliates' => $affiliates
        ]);
    }

    // 2. Payout Requests ki list
    public function payoutRequests()
    {
        $payouts = PayoutRequest::with('affiliate.user')
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('Admin/Affiliate/PendingPayouts', [
            'payouts' => $payouts
        ]);
    }

    // 3. Referral Logs (Sales History)
    public function logs()
    {
        $logs = Referral::with(['affiliate.user', 'order'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Affiliate/ReferralLogs', [
            'logs' => $logs
        ]);
    }

    // 4. Payout Approve karne ka logic
    public function approvePayout($id)
    {
        $payout = PayoutRequest::findOrFail($id);
        $affiliate = $payout->affiliate;

        if ($payout->status == 'pending') {
            // Amount pehle hi referral approved hone par balance mein add ho chuki hoti hai
            // Payout approve hone par sirf status complete hoga. 
            // Note: Balance tab deduct hota hai jab request submit ho ya approve ho (Aapke purane logic ke mutabiq)
            $affiliate->decrement('balance', $payout->amount);
            $payout->update(['status' => 'completed']);
            
            return back()->with('success', 'Payout marked as paid successfully!');
        }

        return back()->with('error', 'Invalid payout request.');
    }

    // 5. Affiliate ka status toggle (Active/Block)
    public function updateStatus($id)
    {
        $affiliate = Affiliate::findOrFail($id);
        $affiliate->update([
            'status' => $affiliate->status == 1 ? 0 : 1
        ]);

        return back()->with('success', 'Affiliate status updated!');
    }



public function settings()
{
    // Settings ko key-value pair mein convert kar ke bhejein
    $settings = AffiliateSetting::pluck('value', 'key')->all();
    
    return Inertia::render('Admin/Affiliate/SystemSettings', [
        'settings' => $settings
    ]);
}

public function updateSettings(Request $request)
{
    $validated = $request->validate([
        'default_commission' => 'required|numeric|min:0',
        'min_payout' => 'required|numeric|min:0',
        'cookie_duration' => 'required|integer|min:1',
    ]);

    foreach ($validated as $key => $value) {
        AffiliateSetting::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    return back()->with('success', 'Settings updated successfully!');
}
}