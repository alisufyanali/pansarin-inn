<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;

class PayoutController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:1000']);
        $affiliate = auth()->user()->affiliate;

        if ($affiliate->balance < $request->amount) {
            return response()->json(['message' => 'Balance kam hai.'], 400);
        }

        $payout = PayoutRequest::create([
            'affiliate_id' => $affiliate->id,
            'amount' => $request->amount,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Withdraw request bhej di gayi hai.', 'payout' => $payout]);
    }
}