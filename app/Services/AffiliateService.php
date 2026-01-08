<?php

namespace App\Services;

use App\Models\Affiliate;
use App\Models\Referral;
use App\Models\AffiliateSetting;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;

class AffiliateService
{
    /**
     * Create referral when order is placed
     */
    public function recordReferral($order): void
    {
        // Prevent duplicate referral
        if (Referral::where('order_id', $order->id)->exists()) {
            return;
        }

        $affiliateCode = Cookie::get('affiliate_referral');
        if (!$affiliateCode) return;

        $affiliate = Affiliate::where('affiliate_code', $affiliateCode)
            ->where('status', 1)
            ->first();

        if (!$affiliate) return;

        // Self-order protection
        if ($order->customer_id === $affiliate->user_id) return;

        $rate = AffiliateSetting::where('key', 'default_commission')->value('value')
            ?? $affiliate->commission_rate;

        $baseAmount = $order->grand_total;
        $commissionAmount = ($baseAmount * $rate) / 100;

        Referral::create([
            'affiliate_id'       => $affiliate->id,
            'order_id'           => $order->id,
            'user_id'            => $order->customer_id,
            'order_amount'       => $baseAmount,
            'commission_amount'  => $commissionAmount,
            'referral_type'      => 'direct',
            'status'             => 'pending',
        ]);
    }

    /**
     * Update referral if order amount changes (before approval)
     */
    public function updateReferral($order): void
    {
        $referral = Referral::where('order_id', $order->id)
            ->where('referral_type', 'direct')
            ->first();

        if (!$referral || $referral->status !== 'pending') return;

        $affiliate = $referral->affiliate;

        $rate = AffiliateSetting::where('key', 'default_commission')->value('value')
            ?? $affiliate->commission_rate;

        $baseAmount = $order->grand_total;
        $newCommission = ($baseAmount * $rate) / 100;

        $referral->update([
            'order_amount'      => $baseAmount,
            'commission_amount' => $newCommission,
        ]);
    }

    /**
     * Finalize commission on order status change
     */
    public function finalizeCommission($order): void
    {
        DB::transaction(function () use ($order) {

            $referral = Referral::where('order_id', $order->id)
                ->where('referral_type', 'direct')
                ->lockForUpdate()
                ->first();

            if (!$referral) return;

            /**
             * ORDER DELIVERED
             */
            if ($order->status === 'delivered' && $referral->status === 'pending') {

                // Approve direct referral
                $referral->update(['status' => 'approved']);
                $referral->affiliate->increment('balance', $referral->commission_amount);

                // LEVEL 2 COMMISSION
                $parentId = $referral->affiliate->parent_id;
                if ($parentId) {

                    $parent = Affiliate::where('id', $parentId)
                        ->where('status', 1)
                        ->first();

                    if ($parent) {
                        $exists = Referral::where('order_id', $order->id)
                            ->where('referral_type', 'level_2')
                            ->exists();

                        if (!$exists) {
                            $l2Rate = AffiliateSetting::where('key', 'level_2_commission')->value('value') ?? 2;
                            $baseAmount = $order->grand_total;
                            $parentCommission = ($baseAmount * $l2Rate) / 100;

                            $parent->increment('balance', $parentCommission);

                            Referral::create([
                                'affiliate_id'      => $parent->id,
                                'order_id'          => $order->id,
                                'user_id'           => $order->customer_id,
                                'order_amount'      => $baseAmount,
                                'commission_amount' => $parentCommission,
                                'referral_type'     => 'level_2',
                                'status'            => 'approved',
                            ]);
                        }
                    }
                }
            }

            /**
             * ORDER CANCELLED / REFUNDED
             */
            if (in_array($order->status, ['cancelled', 'refunded'])) {

                // Direct referral rollback
                if ($referral->status === 'approved') {
                    $referral->affiliate->decrement('balance', $referral->commission_amount);
                }

                $referral->update(['status' => 'rejected']);

                // Level 2 rollback
                $level2 = Referral::where('order_id', $order->id)
                    ->where('referral_type', 'level_2')
                    ->first();

                if ($level2 && $level2->status === 'approved') {
                    $level2->affiliate->decrement('balance', $level2->commission_amount);
                    $level2->update(['status' => 'rejected']);
                }
            }
        });
    }
}
