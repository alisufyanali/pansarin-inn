<?php

namespace App\Http\Controllers\Affiliate;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use App\Models\WalletTransaction;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PayoutController extends Controller
{
    public function index()
    {
        $affiliate = auth()->user()->affiliate;

        // 1. Available Wallet Balance (Polymorphic Relation se)
        $walletBalance = $affiliate->wallet->balance ?? 0;

        // 2. Pending Payouts (Jo requests abhi pending ya processing hain)
        $pendingBalance = $affiliate->payoutRequests()
            ->whereIn('status', ['pending', 'processing'])
            ->sum('amount');

        // 3. Completed Payouts (Total Paid amount)
        $totalPaid = $affiliate->payoutRequests()
            ->where('status', 'completed')
            ->sum('amount');

        // 4. Saved Payment Methods
        $paymentMethods = $affiliate->paymentMethods()
            ->latest()
            ->get()
            ->map(function($method) {
                return [
                    'id'             => $method->id,
                    'provider'       => $method->type, // e.g., EasyPaisa, Meezan
                    'account_name'   => $method->title,
                    'account_number' => $method->account_number,
                    'iban_number'    => $method->iban_number,
                    'is_primary'     => $method->is_default,
                ];
            });

        // 5. Past Payout History
        $payoutHistory = $affiliate->payoutRequests()
            ->latest()
            ->get()
            ->map(function($payout) {
                return [
                    'id'             => $payout->id,
                    'amount'         => number_format($payout->amount, 2),
                    'status'         => $payout->status, // pending, processing, completed, rejected
                    'transaction_id' => $payout->transaction_id ?? '---', 
                    'method'         => $payout->payment_method_snapshot ?? 'N/A',
                    'account_name'   => $payout->account_name ?? '', 
                    'account_number' => $payout->account_number ?? '',
                    'date'           => $payout->created_at->format('d M Y, h:i A'),
                    'admin_note'     => $payout->admin_note,
                ];
            });

        return Inertia::render('Affiliate/Payouts', [
            'wallet_balance'  => number_format($walletBalance, 2),
            'pending_balance' => number_format($pendingBalance, 2),
            'total_paid'      => number_format($totalPaid, 2),
            'raw_balance'     => $walletBalance, // Frontend submit button check ke liye
            'payment_methods' => $paymentMethods,
            'payout_history'  => $payoutHistory
        ]);
    }

    public function store(Request $request)
    {
        $affiliate = auth()->user()->affiliate;
        $wallet = $affiliate->wallet;
        $walletBalance = $wallet->balance ?? 0;

        // 1. Strict Validation
        $request->validate([
            'amount' => [
                'required',
                'numeric',
                'min:500',
                "max:{$walletBalance}",
            ],
            'payment_method_id' => 'required|exists:payment_methods,id,affiliate_id,' . $affiliate->id,
        ], [
            'amount.max' => 'Aapke wallet mein itna balance maujood nahi hai.',
            'amount.min' => 'Kam az kam Rs. 500 withdraw kiye ja sakte hain.',
            'payment_method_id.exists' => 'Muntakhib karda payment method darust nahi hai.',
        ]);

        $amount = $request->amount;
        
        // Is affiliate ka bna huwa payment method nikalna
        $method = $affiliate->paymentMethods()->findOrFail($request->payment_method_id);

        // String snapshot aur detail array snapshot dono ready karna
        $snapshotString = "{$method->type} — {$method->title} ({$method->account_number})";
        
        $detailsSnapshot = [
            'account_name'   => $method->title,
            'account_number' => $method->account_number,
            'iban_number'    => $method->iban_number,
        ];

        // 2. Database Transaction taake koi aik query fail ho to sab rollback ho jaye
        DB::transaction(function () use ($wallet, $affiliate, $amount, $method, $snapshotString, $detailsSnapshot) {
            
            // Step A: Wallet balance se amount fauri minus (Freeze) karein
            $wallet->decrement('balance', $amount);
            $affiliate->decrement('balance', $amount);

            // Step B: Wallet Transaction Ledger mein entry (Debit Record)
            $wallet->transactions()->create([
                'amount'      => $amount,
                'type'        => 'debit', 
                'action'      => 'withdraw',
                'description' => 'Payout request submitted (' . $snapshotString . ')',
                'status'      => 'pending', 
            ]);

            // Step C: Payout Request create karein
            $affiliate->payoutRequests()->create([
                'payment_method_id'        => $method->id,
                'amount'                   => $amount,
                'status'                   => 'pending',
                'payment_method_snapshot'  => $snapshotString,
                'payment_details_snapshot' => json_encode($detailsSnapshot), 
                'account_name'             => $method->title,
                'account_number'           => $method->account_number,
            ]);
        });

        return redirect()->back()->with('success', 'Withdrawal request kamyabi se submit ho gayi hai aur balance freeze kar diya gaya hai!');
    }

    public function storePaymentMethod(Request $request)
    {
        $validated = $request->validate([
            'provider'       => 'required|string',
            'account_name'   => 'required|string',
            'account_number' => 'required|string',
            'iban_number'    => 'nullable|string',
        ]);

        $affiliate = auth()->user()->affiliate;

        $affiliate->paymentMethods()->create([
            'type'           => $validated['provider'],      
            'title'          => $validated['account_name'],  
            'account_number' => $validated['account_number'],
            'iban_number'    => $validated['iban_number'],
            'bank_name'      => $validated['provider'],      
            'branch_code'    => null, 
            'is_default'     => $affiliate->paymentMethods()->count() === 0, 
        ]);

        return redirect()->back()->with('success', 'Payment method added successfully!');
    }

    public function destroyPaymentMethod($id)
    {
        $affiliate = auth()->user()->affiliate;
        $paymentMethod = $affiliate->paymentMethods()->findOrFail($id);
        $wasDefault = $paymentMethod->is_default;

        $paymentMethod->delete();

        if ($wasDefault) {
            $nextMethod = $affiliate->paymentMethods()->first();
            if ($nextMethod) {
                $nextMethod->update(['is_default' => true]);
            }
        }

        return redirect()->back()->with('success', 'Payment method deleted successfully!');
    }
}