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
        // Pending applications first, then the rest (newest first)
        $affiliates = Affiliate::with('user:id,name,email,phone,username')
            ->withCount('commissions')
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->latest()
            ->get()
            ->map(function ($affiliate) {
                return [
                    'id'               => $affiliate->id,
                    'affiliate_code'   => $affiliate->affiliate_code,
                    'balance'          => (float) ($affiliate->balance ?? 0),
                    // null = uses the default from Affiliate Settings
                    'fixed_commission' => $affiliate->fixed_commission,
                    'commission_per_order' => $affiliate->commissionPerOrder(),
                    'status'           => $affiliate->status, // pending | active | blocked
                    'orders'           => $affiliate->commissions_count,
                    'referrals'        => \App\Models\User::where('referred_by', $affiliate->user_id)->count(),
                    'notes'            => $affiliate->notes,
                    'payment'          => array_filter([
                        'method'  => $affiliate->payment_method,
                        'title'   => $affiliate->payment_account_title,
                        'account' => $affiliate->payment_account_no_details,
                        'iban'    => $affiliate->payment_iban_details,
                    ]),
                    'applied_at'       => $affiliate->created_at?->format('d M Y'),
                    'user'             => [
                        'name'  => $affiliate->user?->name,
                        'email' => $affiliate->user?->email,
                        'phone' => $affiliate->user?->phone ?? $affiliate->user?->username,
                    ],
                ];
            });

        return Inertia::render('Admin/Affiliate/AffiliateManager', [
            'affiliates'        => $affiliates,
            'defaultCommission' => (float) (\App\Models\AffiliateSetting::where('key', 'default_commission')->value('value') ?? 0),
        ]);
    }

    /** Approve a pending (or re-activate a blocked) affiliate: gives the affiliate role. */
    public function approve($id)
    {
        $affiliate = Affiliate::with('user')->findOrFail($id);

        $affiliate->update([
            'status'      => 'active',
            'approved_by' => auth()->id(),
            'joined_at'   => $affiliate->joined_at ?? now(),
        ]);

        if ($affiliate->user && ! $affiliate->user->hasRole('affiliate')) {
            $affiliate->user->assignRole('affiliate');
        }

        return back()->with('success', 'Affiliate approved — they can now sign in to the affiliate dashboard.');
    }

    /** Reject a pending application or block an active affiliate. */
    public function block($id)
    {
        $affiliate = Affiliate::with('user')->findOrFail($id);
        $affiliate->update(['status' => 'blocked']);

        if ($affiliate->user?->hasRole('affiliate')) {
            $affiliate->user->removeRole('affiliate');
        }

        return back()->with('success', 'Affiliate blocked.');
    }

    /** Rs per delivered referred order for this affiliate (empty = use the default). */
    public function updateCommission(Request $request, $id)
    {
        $data = $request->validate(['fixed_commission' => 'nullable|numeric|min:0|max:100000']);

        Affiliate::findOrFail($id)->update(['fixed_commission' => $data['fixed_commission'] ?? null]);

        return back()->with('success', 'Commission updated.');
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

    // Kept for existing links: toggles between approved and blocked
    public function updateStatus($id)
    {
        return Affiliate::findOrFail($id)->status === 'active' ? $this->block($id) : $this->approve($id);
    }


}