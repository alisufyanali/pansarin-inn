<?php

namespace App\Services;

use App\Models\GeneralSetting;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\PointTransaction;
use Illuminate\Validation\ValidationException;

/**
 * Spending loyalty points at checkout.
 *
 * Value per point comes from the loyalty_redemption_rate setting
 * (Admin → Loyalty Settings, Rs per point; default 0.02 = 50 points for Rs 1,
 * 0 = redemption off). Points only buy whole rupees, so only the points that
 * turn into rupees are spent. The discount is capped at the order amount
 * after deals and coupon (never shipping), and is added to the order's
 * invoice_discount, so every total/report already includes it.
 *
 * Ledger: a 'redeemed' PointTransaction with negative points when the order
 * is placed, and a 'redeemed' one with positive points (reason
 * order_cancelled) when that order is cancelled.
 */
class LoyaltyRedemptionService
{
    public const DEFAULT_RATE = 0.02;

    /** Rs per point; 0 means redemption is switched off. */
    public function rate(): float
    {
        $value = GeneralSetting::where('type', 'loyalty_redemption_rate')->value('value');

        return max(0.0, $value !== null ? (float) $value : self::DEFAULT_RATE);
    }

    /** Fewest points that buy Rs 1 (null when redemption is off). */
    public function minPoints(): ?int
    {
        $rate = $this->rate();

        return $rate > 0 ? (int) ceil(1 / $rate - 1e-9) : null;
    }

    public function balance(int $customerId): int
    {
        return (int) (LoyaltyPoint::where('customer_id', $customerId)->value('balance') ?? 0);
    }

    /** Rupee value of a points balance (whole rupees). */
    public function valueOf(int $points): float
    {
        return (float) floor($points * $this->rate() + 1e-9);
    }

    /**
     * Points actually spent and the rupee discount they give.
     *
     * @return array{points:int, discount:float}
     *
     * @throws ValidationException
     */
    public function quote(int $requested, int $balance, float $payable): array
    {
        $rate = $this->rate();
        $fail = fn (string $msg) => throw ValidationException::withMessages(['redeem_points' => [$msg]]);

        if ($rate <= 0) {
            $fail('Points redemption is currently not available.');
        }
        if ($requested > $balance) {
            $fail("You only have {$balance} points.");
        }

        $rupees = floor(min($requested * $rate, max(0, $payable)) + 1e-9);
        if ($rupees < 1) {
            $fail($payable < 1
                ? 'There is nothing left to pay with points on this order.'
                : 'Redeem at least ' . $this->minPoints() . ' points.');
        }

        return [
            'points'   => min($requested, (int) ceil($rupees / $rate - 1e-9)),
            'discount' => (float) $rupees,
        ];
    }

    /**
     * Take the order's points off the customer's balance. Call inside the order
     * transaction — the balance row is locked so parallel checkouts cannot overspend.
     *
     * @throws ValidationException
     */
    public function redeem(Order $order, int $points): void
    {
        if ($points <= 0) {
            return;
        }

        $loyalty = LoyaltyPoint::where('customer_id', $order->customer_id)->lockForUpdate()->first();
        if (! $loyalty || $loyalty->balance < $points) {
            throw ValidationException::withMessages([
                'redeem_points' => ['Your points balance has changed. Please refresh and try again.'],
            ]);
        }

        $loyalty->decrement('balance', $points);

        PointTransaction::create([
            'customer_id' => $order->customer_id,
            'points'      => -$points,
            'type'        => 'redeemed',
            'reason'      => 'order_redemption',
            'reference'   => $order->order_number,
        ]);
    }

    /** Give the points back when the order is cancelled (once per order). */
    public function refund(Order $order): void
    {
        $points = (int) ($order->points_redeemed ?? 0);
        if ($points <= 0 || ! $order->customer_id) {
            return;
        }

        $alreadyRefunded = PointTransaction::where('customer_id', $order->customer_id)
            ->where('reference', $order->order_number)
            ->where('type', 'redeemed')
            ->where('points', '>', 0)
            ->exists();
        if ($alreadyRefunded) {
            return;
        }

        LoyaltyPoint::firstOrCreate(['customer_id' => $order->customer_id], ['balance' => 0])
            ->increment('balance', $points);

        PointTransaction::create([
            'customer_id' => $order->customer_id,
            'points'      => $points,
            'type'        => 'redeemed',
            'reason'      => 'order_cancelled',
            'reference'   => $order->order_number,
        ]);
    }
}
