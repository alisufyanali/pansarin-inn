<?php

namespace App\Http\Repositories\Admin;

use Illuminate\Support\Facades\DB;

/**
 * All queries are pure DB aggregates — no Eloquent loops, no N+1 risk.
 * Indexes already in place:
 *   orders.status, orders.customer_id, orders.created_at (via status composite index)
 *   product_stocks.product_id + product_variant_id (composite index migration)
 *   return_requests.status (index migration)
 *   customers.created_at (implicit PK scan — small table)
 */
class DashboardRepository
{
    // ── All KPIs in one call — 8 fast aggregate queries ──────────

    public function getKpis(): array
    {
        $today     = today()->toDateString();
        $monthStart= today()->startOfMonth()->toDateString();
        $weekAgo   = today()->subDays(6)->toDateString();

        // 1. Today's orders + revenue
        $todayStats = DB::table('orders')
            ->whereNull('deleted_at')
            ->whereDate('created_at', $today)
            ->selectRaw("COUNT(*) as orders, SUM(CASE WHEN status NOT IN ('cancelled','refunded') THEN grand_total ELSE 0 END) as revenue")
            ->first();

        // 2. Month-to-date revenue
        $mtdRevenue = (float) DB::table('orders')
            ->whereNull('deleted_at')
            ->whereDate('created_at', '>=', $monthStart)
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->sum('grand_total');

        // 3. Pending orders count
        $pendingOrders = (int) DB::table('orders')
            ->whereNull('deleted_at')
            ->where('status', 'pending')
            ->count();

        // 4. Low stock alerts — products/variants where stock <= 10
        $lowStockCount = (int) DB::table('product_stocks')
            ->where('quantity', '>', 0)
            ->where('quantity', '<=', 10)
            ->count();

        // 5. Pending return requests
        $pendingReturns = (int) DB::table('return_requests')
            ->where('status', 'pending')
            ->count();

        // 6. New customers today
        $newCustomersToday = (int) DB::table('customers')
            ->whereDate('created_at', $today)
            ->count();

        // 7. Top selling product (last 7 days)
        $topProduct = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('products as p', 'oi.product_id', '=', 'p.id')
            ->whereNull('o.deleted_at')
            ->whereNull('oi.deleted_at')
            ->whereDate('o.created_at', '>=', $weekAgo)
            ->whereNotIn('o.status', ['cancelled', 'refunded'])
            ->selectRaw('oi.product_id, p.name as product_name, SUM(oi.quantity) as units_sold, SUM(oi.subtotal) as revenue')
            ->groupBy('oi.product_id', 'p.name')
            ->orderByDesc('revenue')
            ->first();

        return [
            'today_orders'       => (int) ($todayStats->orders ?? 0),
            'today_revenue'      => round((float) ($todayStats->revenue ?? 0), 2),
            'mtd_revenue'        => round($mtdRevenue, 2),
            'pending_orders'     => $pendingOrders,
            'low_stock_count'    => $lowStockCount,
            'pending_returns'    => $pendingReturns,
            'new_customers_today'=> $newCustomersToday,
            'top_product'        => $topProduct ? [
                'id'         => $topProduct->product_id,
                'name'       => $topProduct->product_name,
                'units_sold' => (int) $topProduct->units_sold,
                'revenue'    => round((float) $topProduct->revenue, 2),
            ] : null,
        ];
    }

    // ── Revenue trend last 30 days ────────────────────────────────

    public function revenueTrend(): array
    {
        $from = today()->subDays(29)->toDateString();

        $rows = DB::table('orders')
            ->whereNull('deleted_at')
            ->whereDate('created_at', '>=', $from)
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->selectRaw("strftime('%Y-%m-%d', created_at) as day, SUM(grand_total) as revenue, COUNT(*) as orders")
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        // Fill gaps so every day in range is represented
        $trend = [];
        for ($i = 29; $i >= 0; $i--) {
            $day = today()->subDays($i)->toDateString();
            $trend[] = [
                'day'     => $day,
                'revenue' => round((float) ($rows[$day]->revenue ?? 0), 2),
                'orders'  => (int) ($rows[$day]->orders ?? 0),
            ];
        }

        return $trend;
    }

    // ── Recent activity feed ──────────────────────────────────────

    public function recentActivity(): array
    {
        // Last 10 orders — single query with LEFT JOIN for customer name
        $orders = DB::table('orders as o')
            ->leftJoin('customers as c', 'o.customer_id', '=', 'c.id')
            ->whereNull('o.deleted_at')
            ->select([
                'o.id',
                'o.order_number',
                'o.status',
                'o.grand_total',
                'o.created_at',
                DB::raw("COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') as customer_name"),
                'c.phone as customer_phone',
            ])
            ->orderByDesc('o.created_at')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'type'          => 'order',
                'id'            => $r->id,
                'label'         => $r->order_number,
                'status'        => $r->status,
                'amount'        => round((float) $r->grand_total, 2),
                'customer_name' => trim($r->customer_name),
                'customer_phone'=> $r->customer_phone,
                'created_at'    => $r->created_at,
                'url'           => '/admin/orders/' . $r->id,
            ])->toArray();

        // Last 5 return requests — single query with LEFT JOIN
        $returns = DB::table('return_requests as rr')
            ->leftJoin('orders as o', 'rr.order_id', '=', 'o.id')
            ->leftJoin('users as u', 'rr.user_id', '=', 'u.id')
            ->select([
                'rr.id',
                'rr.status',
                'rr.reason_category',
                'rr.created_at',
                'o.order_number',
                'u.name as user_name',
            ])
            ->orderByDesc('rr.created_at')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'type'          => 'return',
                'id'            => $r->id,
                'label'         => 'Return for ' . ($r->order_number ?? '#?'),
                'status'        => $r->status,
                'reason'        => $r->reason_category,
                'customer_name' => $r->user_name ?? '—',
                'created_at'    => $r->created_at,
                'url'           => '/admin/returns/' . $r->id,
            ])->toArray();

        // Merge and sort by created_at descending
        $feed = array_merge($orders, $returns);
        usort($feed, fn ($a, $b) => strcmp($b['created_at'], $a['created_at']));

        return array_slice($feed, 0, 15);
    }
}
