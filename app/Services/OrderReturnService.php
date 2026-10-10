<?php

namespace App\Services;

use App\Models\AffiliateCommission;
use App\Models\Inventory;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\ReturnRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * What happens to stock, loyalty points and affiliate commission when goods
 * come back.
 *
 * - A completed return request (some or all items): returned goods go back
 *   into stock, and the points earned on the order are taken back in
 *   proportion to the value returned. When everything has come back the
 *   order becomes 'refunded' (Returned).
 * - An order marked 'refunded' (from the order screen, bulk status, or a
 *   sale marked Returned): everything still out of stock goes back, all the
 *   points earned on it are taken back, points spent on it are given back,
 *   and the affiliate commission is reversed.
 *
 * Every step works from what has already happened (net stock movement,
 * points already taken back, commission status), so running it twice — or a
 * partial return followed by a full one — never counts anything twice.
 */
class OrderReturnService
{
    /** Days after delivery a customer can ask for a return */
    public const RETURN_DAYS = 7;

    public function __construct(private LoyaltyRedemptionService $redemption) {}

    // ── Can the customer return it? ───────────────────────────────

    /**
     * Whether this signed-in customer can request a return of the order, why
     * not, and their existing request. My Orders and POST /api/returns both use
     * it, so the button and the API always agree.
     *
     * @return array{can_return: bool, reason: ?string, last_day: ?string, request: ?array}
     */
    public function eligibility(Order $order, int $userId): array
    {
        $existing = ReturnRequest::where('order_id', $order->id)->where('user_id', $userId)->latest('id')->first();
        $deliveredAt = $order->sale?->delivery_datetime ?? $order->delivered_at ?? $order->updated_at;
        $lastDay = $deliveredAt ? \Illuminate\Support\Carbon::parse($deliveredAt)->addDays(self::RETURN_DAYS) : null;

        $reason = match (true) {
            $existing !== null                  => 'A return request for this order has already been submitted.',
            $order->user_id === null            => 'Orders placed without signing in cannot be returned online. Please contact us on WhatsApp.',
            $order->display_status !== 'delivered' => 'Returns can only be requested for delivered orders.',
            $lastDay === null || now()->greaterThan($lastDay)
                                                => 'Return window has expired. Returns must be requested within ' . self::RETURN_DAYS . ' days of delivery.',
            default                             => null,
        };

        return [
            'can_return' => $reason === null,
            'reason'     => $reason,
            'last_day'   => $lastDay?->toDateString(),
            'request'    => $existing ? [
                'id'            => $existing->id,
                'status'        => $existing->status,
                'refund_amount' => $existing->refund_amount !== null ? (float) $existing->refund_amount : null,
                'admin_note'    => $existing->admin_note,
                'created_at'    => $existing->created_at,
            ] : null,
        ];
    }

    // ── Return requests ───────────────────────────────────────────

    /** Called when an admin marks a return request 'completed'. */
    public function completeReturn(ReturnRequest $return): void
    {
        $order = $return->order()->first();
        if (! $order) {
            return;
        }

        DB::transaction(function () use ($return, $order) {
            $this->restockReturn($return, $order);
            $this->takeBackEarnedPoints($order, $this->returnedShare($order));
        });

        // Everything came back: the order is Returned (runs reverseOrder via Order::booted)
        if ($this->everythingReturned($order) && ! in_array($order->status, ['refunded', 'cancelled'], true)) {
            $order->update(['status' => 'refunded']);
        }
    }

    /** Put the returned quantities back — never more than the order still has out of stock. */
    private function restockReturn(ReturnRequest $return, Order $order): void
    {
        $reference = 'RETURN-' . $return->id;
        if (Inventory::where('reference', $reference)->exists()) {
            return;
        }

        $return->loadMissing('items.orderItem');

        foreach ($return->items as $item) {
            $orderItem = $item->orderItem;
            // Custom items (no product_id) were never in stock
            if (! $orderItem || ! $orderItem->product_id || $item->quantity <= 0) {
                continue;
            }

            $qty = min((int) $item->quantity, $order->stockStillOut($orderItem->product_id, $orderItem->product_variant_id));
            if ($qty <= 0) {
                continue;
            }

            Inventory::create([
                'product_id'         => $orderItem->product_id,
                'product_variant_id' => $orderItem->product_variant_id,
                'type'               => 'return',
                'quantity'           => $qty,
                'source'             => 'return',
                'reference'          => $reference,
                'note'               => 'Return completed #' . $return->id,
            ]);
        }
    }

    /** Share (0..1) of the order's goods value that has come back in completed returns. */
    private function returnedShare(Order $order): float
    {
        $order->loadMissing('items');
        $total = (float) $order->items->sum(fn ($i) => max(0, $i->price * $i->quantity - $i->discount));
        if ($total <= 0) {
            return 0.0;
        }

        $returned = 0.0;
        foreach ($this->completedReturnItems($order) as $orderItemId => $qty) {
            $item = $order->items->firstWhere('id', $orderItemId);
            if ($item && $item->quantity > 0) {
                $lineValue = max(0, $item->price * $item->quantity - $item->discount);
                $returned += $lineValue * min(1, $qty / $item->quantity);
            }
        }

        return min(1.0, $returned / $total);
    }

    private function everythingReturned(Order $order): bool
    {
        $returned = $this->completedReturnItems($order);
        $order->loadMissing('items');

        return $order->items->isNotEmpty()
            && $order->items->every(fn ($i) => ($returned[$i->id] ?? 0) >= $i->quantity);
    }

    /** order_item_id => quantity returned across all completed returns of the order */
    private function completedReturnItems(Order $order): array
    {
        return DB::table('return_request_items as ri')
            ->join('return_requests as r', 'r.id', '=', 'ri.return_request_id')
            ->where('r.order_id', $order->id)
            ->where('r.status', 'completed')
            ->groupBy('ri.order_item_id')
            ->selectRaw('ri.order_item_id, SUM(ri.quantity) as qty')
            ->pluck('qty', 'order_item_id')
            ->map(fn ($q) => (int) $q)
            ->all();
    }

    // ── Whole order returned ──────────────────────────────────────

    /** Called when an order's status becomes 'refunded' (Returned). */
    public function reverseOrder(Order $order): void
    {
        $order->restoreStock('order_return', 'Order returned #');
        $this->takeBackEarnedPoints($order, 1.0);
        $this->redemption->refund($order);   // points spent on the order come back (once)
        $this->reverseCommission($order);
    }

    // ── Loyalty points ────────────────────────────────────────────

    /**
     * Take back $share of the points earned on the order. Cumulative: the
     * target is share × earned, minus what was already taken back.
     */
    public function takeBackEarnedPoints(Order $order, float $share): void
    {
        if (! $order->customer_id || $share <= 0) {
            return;
        }

        $rows = PointTransaction::where('customer_id', $order->customer_id)
            ->where('reference', $order->order_number)
            ->where('type', 'earned');

        $earned   = (int) (clone $rows)->where('points', '>', 0)->sum('points');
        $takenBack = (int) -(clone $rows)->where('reason', 'order_returned')->sum('points');
        $toTake   = (int) floor($earned * min(1.0, $share) + 1e-9) - $takenBack;

        if ($toTake <= 0) {
            return;
        }

        PointTransaction::create([
            'customer_id' => $order->customer_id,
            'points'      => -$toTake,
            'type'        => 'earned',
            'reason'      => 'order_returned',
            'reference'   => $order->order_number,
        ]);

        // Points already spent cannot be taken back — the balance never goes below 0
        $loyalty = LoyaltyPoint::firstOrCreate(['customer_id' => $order->customer_id], ['balance' => 0]);
        $loyalty->decrement('balance', min($toTake, max(0, (int) $loyalty->balance)));
    }

    // ── Affiliate commission ──────────────────────────────────────

    /** Reverse the order's affiliate commission (once). The balance never goes below 0. */
    public function reverseCommission(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $commission = AffiliateCommission::where('order_id', $order->id)
                ->where('status', 'earned')
                ->lockForUpdate()
                ->first();
            if (! $commission) {
                return;
            }

            $commission->update(['status' => 'cancelled']);

            $affiliate = $commission->affiliate()->lockForUpdate()->first();
            if ($affiliate) {
                $take = min((float) $commission->commission_amount, max(0, (float) $affiliate->balance));
                if ($take > 0) {
                    $affiliate->decrement('balance', $take);   // Affiliate::updated syncs the wallet
                }
                if ($take < (float) $commission->commission_amount) {
                    Log::warning("Commission for {$order->order_number} reversed, but only {$take} of {$commission->commission_amount} was left in the affiliate's balance");
                }
            }
        });
    }
}
