<?php

namespace App\Services;

use App\Models\Affiliate;
use App\Models\AffiliateClick;
use App\Models\AffiliateCommission;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Referral affiliate program.
 *
 * - A visitor arrives on the storefront with ?ref=CODE. The storefront keeps the
 *   code and sends it with registration / orders; attachReferral() then records
 *   the affiliate on the customer's user (first referral wins, never overwritten).
 * - When an order of a referred customer is delivered, the affiliate earns a
 *   fixed amount (Affiliate::commissionPerOrder()) — once per order.
 * - Only approved (active) affiliates earn; nobody earns on their own orders.
 */
class AffiliateService
{
    /** Active affiliate for a referral code, or null. */
    public function activeAffiliateByCode(?string $code): ?Affiliate
    {
        $code = strtoupper(trim((string) $code));
        if ($code === '' || strlen($code) > 50) {
            return null;
        }

        return Affiliate::where('affiliate_code', $code)->where('status', 'active')->first();
    }

    /** Link a customer account to the affiliate that referred it (first referral only). */
    public function attachReferral(?User $user, ?string $code): void
    {
        if (! $user || $user->referred_by) {
            return;
        }

        $affiliate = $this->activeAffiliateByCode($code);
        if (! $affiliate || $affiliate->user_id === $user->id) {
            return;
        }

        $user->forceFill(['referred_by' => $affiliate->user_id])->saveQuietly();
    }

    /** Record a storefront visit through a referral link. */
    public function recordClick(Affiliate $affiliate, array $data): void
    {
        AffiliateClick::create([
            'affiliate_id' => $affiliate->id,
            'clicked_url'  => isset($data['url']) ? substr((string) $data['url'], 0, 255) : null,
            'referrer_url' => isset($data['referrer']) ? substr((string) $data['referrer'], 0, 255) : null,
            'ip_address'   => $data['ip'] ?? null,
            'user_agent'   => isset($data['user_agent']) ? substr((string) $data['user_agent'], 0, 1000) : null,
        ]);
    }

    /** Called when an order is delivered (Order::booted). */
    public function updateReferral(Order $order): void
    {
        if ($order->status !== 'delivered') {
            return;
        }

        $order->loadMissing('customer.user');
        $referredById = $order->customer?->user?->referred_by;
        if (! $referredById || $referredById === $order->customer?->user_id) {
            return;
        }

        $affiliate = Affiliate::where('user_id', $referredById)->first();
        if (! $affiliate || ! $affiliate->isActive()) {
            return;
        }

        $this->processCommission($affiliate, $order);
    }

    protected function processCommission(Affiliate $affiliate, Order $order): void
    {
        $amount = round($affiliate->commissionPerOrder(), 2);
        if ($amount <= 0) {
            return;
        }

        DB::transaction(function () use ($affiliate, $order, $amount) {
            // One commission per order — the unique (affiliate_id, order_id) index backs this up
            if (AffiliateCommission::where('order_id', $order->id)->lockForUpdate()->exists()) {
                Log::info("Commission already processed for Order #{$order->order_number}");

                return;
            }

            AffiliateCommission::create([
                'affiliate_id'          => $affiliate->id,
                'order_id'              => $order->id,
                'order_subtotal'        => $order->subtotal,
                'order_grand_total'     => $order->grand_total,
                'commission_percentage' => 0, // fixed amount per order
                'commission_amount'     => $amount,
                'status'                => 'earned',
            ]);

            // Affiliate::updated keeps the wallet balance in step
            $affiliate->increment('balance', $amount);

            Log::info("Commission of {$amount} added to Affiliate: {$affiliate->affiliate_code}");
        });
    }
}
