<?php

namespace App\Http\Repositories\Admin;

use App\Models\Customer;
use App\Models\LoyaltyPoint;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LoyaltyRepository
{
    // ── Customer list with balance ────────────────────────────────

    public function getAllForDataTable(Request $request)
    {
        // LEFT JOIN loyalty_points so customers with zero/no balance still appear
        $query = Customer::leftJoin('loyalty_points', 'customers.id', '=', 'loyalty_points.customer_id')
            ->select(
                'customers.id',
                'customers.first_name',
                'customers.last_name',
                'customers.phone',
                'customers.email',
                'customers.created_at',
                DB::raw('COALESCE(loyalty_points.balance, 0) as balance')
            );

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customers.first_name', 'like', "%{$search}%")
                  ->orWhere('customers.last_name',  'like', "%{$search}%")
                  ->orWhere('customers.phone',       'like', "%{$search}%")
                  ->orWhere('customers.email',       'like', "%{$search}%");
            });
        }

        // Filter: only customers with points > 0
        if ($request->filled('has_points') && $request->has_points === 'yes') {
            $query->where(DB::raw('COALESCE(loyalty_points.balance, 0)'), '>', 0);
        }

        $allowed   = ['balance', 'first_name', 'created_at'];
        $sortBy    = in_array($request->get('sortBy'), $allowed) ? $request->get('sortBy') : 'balance';
        $sortOrder = $request->get('sortOrder', 'desc') === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'balance') {
            $query->orderByRaw("COALESCE(loyalty_points.balance, 0) {$sortOrder}");
        } else {
            $query->orderBy("customers.{$sortBy}", $sortOrder);
        }

        $rows = $query->paginate(min((int) $request->get('perPage', 15), 100));

        return response()->json([
            'data'         => $rows->map(fn ($r) => [
                'id'         => $r->id,
                'first_name' => $r->first_name,
                'last_name'  => $r->last_name,
                'phone'      => $r->phone,
                'email'      => $r->email,
                'balance'    => (int) $r->balance,
                'created_at' => $r->created_at,
            ]),
            'total'        => $rows->total(),
            'per_page'     => $rows->perPage(),
            'current_page' => $rows->currentPage(),
            'last_page'    => $rows->lastPage(),
        ]);
    }

    // ── Per-customer ledger ───────────────────────────────────────

    public function getCustomerWithHistory(int $customerId, Request $request): array
    {
        $customer = Customer::findOrFail($customerId);

        $loyalty = LoyaltyPoint::firstOrCreate(
            ['customer_id' => $customerId],
            ['balance' => 0]
        );

        $query = PointTransaction::where('customer_id', $customerId)->latest();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $transactions = $query->paginate(min((int) $request->get('per_page', 20), 100));

        return [
            'customer' => [
                'id'         => $customer->id,
                'first_name' => $customer->first_name,
                'last_name'  => $customer->last_name,
                'phone'      => $customer->phone,
                'email'      => $customer->email,
            ],
            'balance'      => (int) $loyalty->balance,
            'transactions' => $transactions->map(fn ($t) => [
                'id'        => $t->id,
                'points'    => $t->points,
                'type'      => $t->type,
                'reason'    => $t->reason,
                'reference' => $t->reference,
                'created_at'=> $t->created_at->toDateTimeString(),
            ]),
            'meta' => [
                'total'        => $transactions->total(),
                'per_page'     => $transactions->perPage(),
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
            ],
        ];
    }

    // ── Manual adjustment ─────────────────────────────────────────

    /**
     * Add (positive) or deduct (negative) points for a customer.
     * Always writes a PointTransaction + updates loyalty_points.balance atomically.
     * Prevents balance from going below zero on deductions.
     */
    public function adjust(int $customerId, int $points, string $reason, ?string $reference = null): PointTransaction
    {
        return DB::transaction(function () use ($customerId, $points, $reason, $reference) {
            $loyalty = LoyaltyPoint::firstOrCreate(
                ['customer_id' => $customerId],
                ['balance' => 0]
            );

            // Guard: don't allow balance to go negative
            if ($points < 0 && ($loyalty->balance + $points) < 0) {
                throw new \InvalidArgumentException(
                    "Cannot deduct {$points} pts — current balance is {$loyalty->balance}."
                );
            }

            $transaction = PointTransaction::create([
                'customer_id' => $customerId,
                'points'      => $points,
                'type'        => 'admin_adjustment',
                'reason'      => $reason,
                'reference'   => $reference,
            ]);

            $loyalty->increment('balance', $points);

            Log::info("Admin adjustment: {$points} pts for customer #{$customerId}. Reason: {$reason}");

            return $transaction;
        });
    }

    // ── Stats ─────────────────────────────────────────────────────

    public function getStats(): array
    {
        $totalBalance = LoyaltyPoint::sum('balance');
        $customersWithPoints = LoyaltyPoint::where('balance', '>', 0)->count();
        $totalEarned = PointTransaction::where('type', 'earned')->sum('points');
        $totalAdjusted = PointTransaction::where('type', 'admin_adjustment')->sum('points');

        return [
            'total_balance'        => (int) $totalBalance,
            'customers_with_points'=> (int) $customersWithPoints,
            'total_earned'         => (int) $totalEarned,
            'total_adjusted'       => (int) $totalAdjusted,
        ];
    }
}
