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
        $affiliate = auth()->user()->affiliate;

        if (!$affiliate) {
            return redirect()->route('affiliate.register.view')
                ->with('error', 'Pehle affiliate register karein.');
        }

        $payouts = PayoutRequest::where('affiliate_id', $affiliate->id)
            ->latest()
            ->get();

        return Inertia::render('Affiliate/Payouts', [
            'payouts' => $payouts,
            'balance' => $affiliate->balance
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:1000']);
        
        $affiliate = auth()->user()->affiliate;

        if (!$affiliate || $affiliate->balance < $request->amount) {
            return back()->with('error', 'Not enough balance.');
        }

        $affiliate->decrement('balance', $request->amount);

        PayoutRequest::create([
            'affiliate_id' => $affiliate->id,
            'amount' => $request->amount,
            'status' => 'pending'
        ]);

        return back()->with('success', 'Withdraw request send successfully');
    }
}