<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
    public function index()
    {
        return response()->json(Affiliate::with('user')->latest()->get());
    }

    public function approvePayout($id)
    {
        $payout = PayoutRequest::findOrFail($id);
        $affiliate = $payout->affiliate;

        if ($payout->status == 'pending') {
            // Balance update karein
            $affiliate->decrement('balance', $payout->amount);
            $payout->update(['status' => 'completed']);
            
            return response()->json(['message' => 'Payout approve ho gaya.']);
        }

        return response()->json(['message' => 'Action invalid.'], 400);
    }
}