<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyPoint;
use App\Models\PointTransaction;
use App\Services\LoyaltyRedemptionService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RewardsApiController extends Controller
{
    public function __construct(protected LoyaltyRedemptionService $redemption) {}

    /**
     * GET /api/rewards
     *
     * Returns the authenticated user's current points balance
     * and a paginated history of all point transactions.
     */
    public function index(Request $request)
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer profile not found.',
            ], 404);
        }

        // Current balance from loyalty_points table
        $loyalty = LoyaltyPoint::firstOrCreate(
            ['customer_id' => $customer->id],
            ['balance' => 0]
        );

        // Paginated transaction history — newest first
        $transactions = PointTransaction::where('customer_id', $customer->id)
            ->latest()
            ->paginate(min(max((int) $request->get('per_page', 15), 1), 50));

        // Wallet balance (store credit) — additive field, existing keys unchanged
        $walletBalance = (float) ($customer->wallet?->balance ?? 0);

        return response()->json([
            'success' => true,
            'data'    => [
                'balance'        => (int) $loyalty->balance,
                'wallet_balance' => $walletBalance,
                'redemption'     => $this->redemptionInfo((int) $loyalty->balance),
                'transactions' => $transactions->map(fn ($t) => [
                    'id'        => $t->id,
                    'points'    => $t->points,   // positive = earned, negative = redeemed
                    'type'      => $t->type,      // earned | redeemed | admin_adjustment (redeemed + positive = returned on cancel)
                    'reason'    => $t->reason,
                    'reference' => $t->reference, // order_number or admin note
                    'date'      => $t->created_at->toDateTimeString(),
                ]),
            ],
            'meta' => [
                'total'        => $transactions->total(),
                'per_page'     => $transactions->perPage(),
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/rewards/redeem
     *
     * Checks how many points can be spent on the current cart and what they
     * are worth. Nothing is deducted here — send the same redeem_points with
     * POST /api/orders and the points are taken when the order is placed
     * (and given back if the order is cancelled).
     *
     * Body: points (optional, default = whole balance), amount (cart total
     * after deals and coupon, without shipping).
     */
    public function redeem(Request $request)
    {
        $request->validate([
            'points' => 'nullable|integer|min:1',
            'amount' => 'required|numeric|min:0',
        ]);

        $customer = $request->user()->customer;
        if (! $customer) {
            return response()->json(['success' => false, 'message' => 'Customer profile not found.'], 404);
        }

        $balance = $this->redemption->balance($customer->id);

        try {
            $quote = $this->redemption->quote(
                (int) ($request->input('points') ?? $balance),
                $balance,
                (float) $request->input('amount')
            );
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
                'data'    => $this->redemptionInfo($balance),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "{$quote['points']} points = Rs " . number_format($quote['discount']) . ' off. Place the order to use them.',
            'data'    => array_merge($this->redemptionInfo($balance), [
                'redeem_points' => $quote['points'],     // send this as redeem_points with POST /api/orders
                'discount'      => $quote['discount'],
                'balance_after' => $balance - $quote['points'],
            ]),
        ]);
    }

    private function redemptionInfo(int $balance): array
    {
        $rate = $this->redemption->rate();

        return [
            'enabled'         => $rate > 0,
            'rupee_per_point' => $rate,
            'min_points'      => $this->redemption->minPoints(), // points for Rs 1 (50 at the default rate)
            'balance'         => $balance,
            'balance_value'   => $this->redemption->valueOf($balance),
        ];
    }
}
