<?php

namespace App\Observers;

use App\Models\GeneralSetting;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\PointTransaction;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    /**
     * Credit loyalty points when an order is marked delivered.
     * Rule: 1 point per Rs. 100 spent (floor).
     * Idempotent: skipped if a transaction for this order already exists.
     */
    public function updated(Order $order): void
    {
        if (! $order->wasChanged('status') || $order->status !== 'delivered') {
            return;
        }

        $order->loadMissing('customer');

        if (! $order->customer) {
            return;
        }

        $customerId = $order->customer->id;

        // Idempotency check — don't double-credit
        $alreadyCredited = PointTransaction::where('customer_id', $customerId)
            ->where('reference', $order->order_number)
            ->where('type', 'earned')
            ->exists();

        if ($alreadyCredited) {
            return;
        }

        // Read earning rate from settings — fallback to 0.01 (1 pt per Rs.100)
        $rateRaw     = GeneralSetting::where('type', 'loyalty_points_per_rupee')->value('value');
        $rate        = $rateRaw !== null ? (float) $rateRaw : 0.01;

        // Respect minimum order amount setting
        $minAmount   = (float) (GeneralSetting::where('type', 'loyalty_min_order_amount')->value('value') ?? 0);
        if ($minAmount > 0 && $order->grand_total < $minAmount) {
            return;
        }

        $pointsToEarn = (int) floor($order->grand_total * $rate);

        if ($pointsToEarn <= 0) {
            return;
        }

        try {
            // Insert transaction record
            PointTransaction::create([
                'customer_id' => $customerId,
                'points'      => $pointsToEarn,
                'type'        => 'earned',
                'reason'      => 'purchase',
                'reference'   => $order->order_number,
            ]);

            // Update or create the running balance in loyalty_points
            $loyalty = LoyaltyPoint::firstOrCreate(
                ['customer_id' => $customerId],
                ['balance' => 0]
            );

            $loyalty->increment('balance', $pointsToEarn);

            Log::info("Loyalty points credited: {$pointsToEarn} pts to customer #{$customerId} for order {$order->order_number}");
        } catch (\Throwable $e) {
            Log::error("Failed to credit loyalty points for order {$order->order_number}: " . $e->getMessage());
        }
    }
}
