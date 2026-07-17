<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyPoint;
use App\Models\PointTransaction;
use Illuminate\Http\Request;

class RewardsApiController extends Controller
{
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
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => [
                'balance'      => (int) $loyalty->balance,
                'transactions' => $transactions->map(fn ($t) => [
                    'id'        => $t->id,
                    'points'    => $t->points,   // positive = earned, negative = redeemed
                    'type'      => $t->type,      // earned | redeemed | admin_adjustment
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
}
