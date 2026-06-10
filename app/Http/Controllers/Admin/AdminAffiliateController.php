<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminAffiliateController extends Controller
{
    public function index()
    {
        // Sab affiliates ko unke user details ke sath uthayein
        $affiliates = Affiliate::with('user:id,first_name,last_name,email')
            ->latest()
            ->get()
            ->map(function($affiliate) {
                return [
                    'id' => $affiliate->id,
                    'affiliate_code' => $affiliate->affiliate_code,
                    'balance' => $affiliate->balance ?? 0,
                    'commission_rate' => $affiliate->commission_rate,
                    'status' => $affiliate->status === 'active' ? true : false,
                    'user' => [
                        'first_name' => $affiliate->user->first_name,
                        'last_name' => $affiliate->user->last_name,
                        'email' => $affiliate->user->email,
                    ]
                ];
            });

        return Inertia::render('Admin/Affiliate/AffiliateManager', [
            'affiliates' => $affiliates
        ]);
    }

    public function referralLogs()
    {
        // Hum nested relationships ko baghair select constraints ke load kar rahe hain
        $logs = \App\Models\AffiliateCommission::with(['affiliate.user', 'order'])
            ->latest()
            ->get()
            ->map(function($log) {
                $affiliate = $log->affiliate;
                $user = $affiliate ? $affiliate->user : null;

                // Agar user mil gaya to naam, warna ID dikhayen debug ke liye
                $name = $user ? trim($user->first_name . ' ' . $user->last_name) : null;
                
                if (!$name && $user) {
                    $name = $user->name; // Agar aapke table mein sirf 'name' column hai
                }

                return [
                    'id' => $log->id,
                    'affiliate_name' => $name ?: 'Affiliate User Not Found (Aff-ID: '.$log->affiliate_id.')',
                    'order_number' => $log->order->order_number ?? 'N/A',
                    'order_amount' => number_format($log->order_subtotal, 2),
                    'commission_amount' => number_format($log->commission_amount, 2),
                    'commission_percentage' => $log->commission_percentage . '%',
                    'status' => $log->status,
                    'date' => $log->created_at->format('d M Y, h:i A'),
                ];
            });

        return Inertia::render('Admin/Affiliate/ReferralLogs', [
            'logs' => $logs
        ]);
    }

    public function updateStatus($id)
    {
        $affiliate = Affiliate::findOrFail($id);
        
        // Status toggle logic
        $affiliate->status = ($affiliate->status === 'active') ? 'blocked' : 'active';
        $affiliate->save();

        return back()->with('success', 'Affiliate status updated successfully!');
    }


}