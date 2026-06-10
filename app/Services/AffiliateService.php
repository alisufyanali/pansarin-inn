<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Referral;
use App\Models\Affiliate;
use App\Models\AffiliateSetting;
use App\Models\AffiliateCommission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;

class AffiliateService
{
    public function updateReferral(Order $order)
    {
        // Customer ke zariye uske referrer (affiliate user id) tak pahuchein
        $referredById = $order->customer->user->referred_by ?? null;

        if (!$referredById) return;

        $affiliate = Affiliate::where('user_id', $referredById)->first();
        if (!$affiliate) return;

        // SIRF tab commission dein jab order status 'delivered' ho
        if ($order->status === 'delivered') {
            $this->processCommission($affiliate, $order);
        }
    }

    protected function processCommission($affiliate, $order)
    {
        // SECURITY CHECK: Kya is Order ID ka commission pehle hi table mein maujood hai?
        // Agar hai, to dubara paise nahi dene (Double counting se bachein)
        $exists = AffiliateCommission::where('order_id', $order->id)->exists();
        
        if ($exists) {
            Log::info("Commission already processed for Order #{$order->order_number}");
            return;
        }

        DB::transaction(function () use ($affiliate, $order) {
            // Commission calculate karein (Subtotal par)
            $commissionAmount = ($order->subtotal * $affiliate->commission_rate) / 100;

            // 1. Commission Record banayein history ke liye
            AffiliateCommission::create([
                'affiliate_id'          => $affiliate->id,
                'order_id'             => $order->id,
                'order_subtotal'       => $order->subtotal,
                'order_grand_total'    => $order->grand_total,
                'commission_percentage' => $affiliate->commission_rate,
                'commission_amount'    => $commissionAmount,
                'status'               => 'earned'
            ]);

            // 2. Affiliate ka wallet balance barhayein
            $affiliate->increment('balance', $commissionAmount);
            
            Log::info("Commission of {$commissionAmount} added to Affiliate: {$affiliate->affiliate_code}");
        });
    }
}