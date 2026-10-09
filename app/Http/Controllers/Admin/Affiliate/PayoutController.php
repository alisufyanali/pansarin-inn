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
     * List pending payout requests
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
     * Approve a payout request (mark as paid)
     */
    public function approve($id)
    {
        $payoutRequest = PayoutRequest::where('status', 'pending')->findOrFail($id);

        DB::transaction(function () use ($payoutRequest) {
            // 1. Mark the payout request completed
            $payoutRequest->update([
                'status' => 'completed',
                'processed_at' => now(),
            ]);

            // 2. Mark the wallet ledger entry as completed / success
            // When the transaction is tracked in its own table:
            $payoutRequest->affiliate->wallet->transactions()
                ->where('status', 'pending')
                ->where('amount', $payoutRequest->amount)
                ->latest()
                ->update([
                    'status' => 'success', // or 'completed', whichever the system uses
                ]);
        });

        return redirect()->back()->with('success', 'Payout request approved successfully!');
    }

    /**
     * Reject a payout request and refund the balance
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
            // 1. Mark the request rejected and save the reason
            $payoutRequest->update([
                'status' => 'rejected',
                'admin_note' => $request->admin_note,
                'processed_at' => now(),
            ]);

            // 2. WALLET TABLE: refund the balance (increment)
            $wallet->increment('balance', $payoutRequest->amount);

            // 3. AFFILIATE TABLE: sync / increment the balance back
            $affiliate->increment('balance', $payoutRequest->amount);

            // 4. Add a rejection / refund entry to the wallet ledger
            $wallet->transactions()->create([
                'amount' => $payoutRequest->amount,
                'type' => 'credit', // The balance comes back, so it is a credit
                'action' => 'refund',
                'description' => 'Payout rejected: ' . $request->admin_note,
                'status' => 'success',
            ]);
        });

        return redirect()->back()->with('success', 'Payout request rejected and the balance refunded.');
    }
}