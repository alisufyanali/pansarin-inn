<?php

namespace App\Http\Controllers\Admin\Affiliate;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PayoutController extends Controller
{
    /**
     * Pending Payout Requests ki list dikhane ke liye
     */
    public function index()
    {
        $payouts = PayoutRequest::with('affiliate.user')->where('status', 'pending')->latest()->get()
            ->map(function ($payout) {
                $payout->created_at_formatted = $payout->created_at->format('d M, Y - h:i A');
                return $payout;
            });

        return Inertia::render('Admin/Affiliate/PendingPayouts', [
            'payouts' => $payouts
        ]);
    }

    /**
     * Payout Request ko Approve (Mark as Paid) karne ke liye
     */
    public function approve($id)
    {
        $payoutRequest = PayoutRequest::where('status', 'pending')->findOrFail($id);

        DB::transaction(function () use ($payoutRequest) {
            // 1. Payout Request ka status completed karein
            $payoutRequest->update([
                'status' => 'completed',
                'processed_at' => now(),
            ]);

            // 2. Wallet Transaction Ledger mein status ko 'completed' ya 'success' mark karein
            // Agar aapke paas transaction table alag track ho rahi hai:
            $payoutRequest->affiliate->wallet->transactions()
                ->where('status', 'pending')
                ->where('amount', $payoutRequest->amount)
                ->latest()
                ->update([
                    'status' => 'success', // ya 'completed' jo bhi aapke system mein hai
                ]);
        });

        return redirect()->back()->with('success', 'Payout request kamyabi se approve ho gayi hai!');
    }

    /**
     * Payout Request ko Reject karne aur balance refund karne ke liye
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'required|string|max:500',
        ]);

        $payoutRequest = PayoutRequest::where('status', 'pending')->findOrFail($id);
        $affiliate = $payoutRequest->affiliate;
        $wallet = $affiliate->wallet;

        DB::transaction(function () use ($payoutRequest, $affiliate, $wallet, $request) {
            // 1. Request status rejected mark karein aur reason save karein
            $payoutRequest->update([
                'status' => 'rejected',
                'admin_note' => $request->admin_note,
                'processed_at' => now(),
            ]);

            // 2. WALLET TABLE: Balance wapas refund (increment) karein
            $wallet->increment('balance', $payoutRequest->amount);

            // 3. AFFILIATE TABLE: Balance wapas sync/increment karein
            $affiliate->increment('balance', $payoutRequest->amount);

            // 4. Wallet Ledger mein Rejection/Refund ki entry dalein
            $wallet->transactions()->create([
                'amount' => $payoutRequest->amount,
                'type' => 'credit', // Ab balance wapas aa raha hai to credit hoga
                'action' => 'refund',
                'description' => 'Payout rejected: ' . $request->admin_note,
                'status' => 'success',
            ]);
        });

        return redirect()->back()->with('success', 'Payout request reject kar di gayi hai aur balance refund ho gaya hai.');
    }
}