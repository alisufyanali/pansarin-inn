<?php

namespace App\Http\Controllers\Affiliate;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayoutController extends Controller
{
    public function index()
    {
        // User ka affiliate data get karein
        $affiliate = auth()->user()->affiliate;

        // AGAR AFFILIATE NAHI HAI TOH ERROR SE BACHNE KE LIYE REDIRECT KAREIN
        if (! $affiliate) {
            return redirect()->route('affiliate.register.view')
                ->with('error', 'Pehle affiliate register karein.');
        }

        $payouts = PayoutRequest::where('affiliate_id', $affiliate->id)
            ->latest()
            ->get();

        return Inertia::render('Affiliate/Payouts', [
            'payouts' => $payouts,
            'balance' => $affiliate->balance,
        ]);
    }

    public function store(Request $request)
    {
        // Aapki purani validation (Min 1000)
        $request->validate(['amount' => 'required|numeric|min:1000']);

        $affiliate = auth()->user()->affiliate;

        if (! $affiliate || $affiliate->balance < $request->amount) {
            return back()->with('error', 'Not enough balance.');
        }

        // 1. Pehle balance deduct karein
        $affiliate->decrement('balance', $request->amount);

        // 2. Phir request create karein
        PayoutRequest::create([
            'affiliate_id' => $affiliate->id,
            'amount' => $request->amount,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Withdraw request send successfully');
    }
}
