<?php

namespace App\Services;

use App\Models\Affiliate;
use App\Models\Referral;
use Illuminate\Support\Facades\Cookie;

class AffiliateService
{
    public function recordReferral($order)
    {
        // Cookie se affiliate code uthayein
        $affiliateCode = Cookie::get('affiliate_referral');
        if (!$affiliateCode) return;

        $affiliate = Affiliate::where('affiliate_code', $affiliateCode)->where('status', 1)->first();
        if (!$affiliate) return;

        // Commission Calculate karein (Subtotal par, tax ya shipping par nahi)
        $commissionAmount = ($order->subtotal * $affiliate->commission_rate) / 100;

        Referral::create([
            'affiliate_id' => $affiliate->id,
            'order_id' => $order->id,
            'user_id' => $order->customer_id,
            'order_amount' => $order->grand_total,
            'commission_amount' => $commissionAmount,
            'status' => 'pending',
        ]);
    }

    public function finalizeCommission($order)
    {
        $referral = Referral::where('order_id', $order->id)->first();
        if (!$referral) return;

        if ($order->status === 'delivered') {
            // Commission approve karein aur affiliate ka balance barhayein
            $referral->update(['status' => 'approved']);
            $referral->affiliate->increment('balance', $referral->commission_amount);
            
            // Yahan Downline (Parent) commission ka logic bhi aa sakta hai
        } 
        elseif (in_array($order->status, ['cancelled', 'refunded'])) {
            $referral->update(['status' => 'rejected']);
        }
    }
}