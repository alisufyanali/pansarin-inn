<?php

namespace App\Http\Repositories\Admin;

use Illuminate\Support\Facades\DB;

/**
 * All queries use DB aggregates (SUM/COUNT/GROUP BY).
 * No Eloquent collection iteration — zero N+1 risk.
 */
class ReportsRepository
{
    // ── Shared date filter helper ─────────────────────────────────

    private function applyDateFilter($query, string $table, ?string $from, ?string $to)
    {
        if ($from) $query->whereDate("{$table}.created_at", '>=', $from);
        if ($to)   $query->whereDate("{$table}.created_at", '<=', $to);
        return $query;
    }

    // ── 1. Sales over time ────────────────────────────────────────

    /**
     * Revenue + order count grouped by day / week / month.
     * Only counts delivered/processing/shipped orders (excludes cancelled/refunded).
     */
    public function salesOverTime(
        string $period  = 'daily',
        ?string $from   = null,
        ?string $to     = null,
        ?string $paymentMethod = null
    ): array {
        $format = match ($period) {
            'weekly'  => '%Y-%u',   // MySQL: ISO week number
            'monthly' => '%Y-%m',
            default   => '%Y-%m-%d',
        };

        $label = match ($period) {
            'weekly'  => 'Week',
            'monthly' => 'Month',
            default   => 'Date',
        };

        $query = DB::table('orders')
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->whereNull('deleted_at')
            ->select([
                DB::raw("DATE_FORMAT(created_at, '{$format}') as period"),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(grand_total) as revenue'),
            ])
            ->groupBy('period')
            ->orderBy('period');

        if ($from) $query->whereDate('created_at', '>=', $from);
        if ($to)   $query->whereDate('created_at', '<=', $to);
        if ($paymentMethod) $query->where('payment_method', $paymentMethod);

        $rows = $query->get();

        return [
            'label'   => $label,
            'rows'    => $rows->map(fn ($r) => [
                'period'  => $r->period,
                'orders'  => (int) $r->orders,
                'revenue' => round((float) $r->revenue, 2),
            ])->toArray(),
            'totals' => [
                'orders'  => $rows->sum('orders'),
                'revenue' => round($rows->sum('revenue'), 2),
            ],
        ];
    }

    // ── 2. Top products ───────────────────────────────────────────

    public function topProducts(
        ?string $from       = null,
        ?string $to         = null,
        ?int    $categoryId = null,
        int     $limit      = 20
    ): array {
        $query = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('products as p', 'oi.product_id', '=', 'p.id')
            ->whereNotIn('o.status', ['cancelled', 'refunded'])
            ->whereNull('o.deleted_at')
            ->whereNull('oi.deleted_at')
            ->select([
                'oi.product_id',
                'p.name as product_name',
                DB::raw('SUM(oi.quantity) as units_sold'),
                DB::raw('SUM(oi.subtotal) as revenue'),
            ])
            ->groupBy('oi.product_id', 'p.name')
            ->orderByDesc('revenue')
            ->limit($limit);

        if ($from) $query->whereDate('o.created_at', '>=', $from);
        if ($to)   $query->whereDate('o.created_at', '<=', $to);
        if ($categoryId) $query->where('p.category_id', $categoryId);

        return DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('products as p', 'oi.product_id', '=', 'p.id')
            ->whereNotIn('o.status', ['cancelled', 'refunded'])
            ->whereNull('o.deleted_at')
            ->whereNull('oi.deleted_at')
            ->when($from, fn ($q) => $q->whereDate('o.created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('o.created_at', '<=', $to))
            ->when($categoryId, fn ($q) => $q->where('p.category_id', $categoryId))
            ->select([
                'oi.product_id',
                'p.name as product_name',
                DB::raw('SUM(oi.quantity) as units_sold'),
                DB::raw('SUM(oi.subtotal) as revenue'),
            ])
            ->groupBy('oi.product_id', 'p.name')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get()
            ->map(fn ($r) => [
                'product_id'   => $r->product_id,
                'product_name' => $r->product_name,
                'units_sold'   => (int) $r->units_sold,
                'revenue'      => round((float) $r->revenue, 2),
            ])
            ->toArray();
    }

    // ── 3. Top customers ──────────────────────────────────────────

    public function topCustomers(
        ?string $from  = null,
        ?string $to    = null,
        int     $limit = 20
    ): array {
        return DB::table('orders as o')
            ->join('customers as c', 'o.customer_id', '=', 'c.id')
            ->whereNotIn('o.status', ['cancelled', 'refunded'])
            ->whereNull('o.deleted_at')
            ->when($from, fn ($q) => $q->whereDate('o.created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('o.created_at', '<=', $to))
            ->select([
                'o.customer_id',
                DB::raw("CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as customer_name"),
                'c.phone',
                'c.email',
                DB::raw('COUNT(o.id) as order_count'),
                DB::raw('SUM(o.grand_total) as total_spent'),
            ])
            ->groupBy('o.customer_id', 'customer_name', 'c.phone', 'c.email')
            ->orderByDesc('total_spent')
            ->limit($limit)
            ->get()
            ->map(fn ($r) => [
                'customer_id'   => $r->customer_id,
                'customer_name' => trim($r->customer_name),
                'phone'         => $r->phone,
                'email'         => $r->email,
                'order_count'   => (int) $r->order_count,
                'total_spent'   => round((float) $r->total_spent, 2),
            ])
            ->toArray();
    }

    // ── 4. Category-wise sales ────────────────────────────────────

    public function categorySales(
        ?string $from = null,
        ?string $to   = null
    ): array {
        return DB::table('order_items as oi')
            ->join('orders as o',    'oi.order_id',    '=', 'o.id')
            ->join('products as p',  'oi.product_id',  '=', 'p.id')
            ->join('categories as c','p.category_id',  '=', 'c.id')
            ->whereNotIn('o.status', ['cancelled', 'refunded'])
            ->whereNull('o.deleted_at')
            ->whereNull('oi.deleted_at')
            ->when($from, fn ($q) => $q->whereDate('o.created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('o.created_at', '<=', $to))
            ->select([
                'p.category_id',
                'c.name as category_name',
                DB::raw('SUM(oi.quantity) as units_sold'),
                DB::raw('SUM(oi.subtotal) as revenue'),
                DB::raw('COUNT(DISTINCT oi.order_id) as orders'),
            ])
            ->groupBy('p.category_id', 'category_name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                'category_id'   => $r->category_id,
                'category_name' => $r->category_name,
                'units_sold'    => (int) $r->units_sold,
                'revenue'       => round((float) $r->revenue, 2),
                'orders'        => (int) $r->orders,
            ])
            ->toArray();
    }

    // ── 5. Payment method breakdown ───────────────────────────────

    public function paymentBreakdown(
        ?string $from = null,
        ?string $to   = null
    ): array {
        return DB::table('orders')
            ->whereNull('deleted_at')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->select([
                DB::raw("COALESCE(payment_method, 'unknown') as payment_method"),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(grand_total) as revenue'),
            ])
            ->groupBy('payment_method')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                'payment_method' => $r->payment_method,
                'order_count'    => (int) $r->order_count,
                'revenue'        => round((float) $r->revenue, 2),
            ])
            ->toArray();
    }

    // ── 6. Returns rate ───────────────────────────────────────────

    public function returnsRate(
        ?string $from = null,
        ?string $to   = null
    ): array {
        $totalOrders = DB::table('orders')
            ->whereNull('deleted_at')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->count();

        $returnsByStatus = DB::table('return_requests')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->select([
                'status',
                DB::raw('COUNT(*) as count'),
            ])
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $totalReturns  = array_sum($returnsByStatus);
        $approvedReturns = $returnsByStatus['approved']  ?? 0;
        $approvedReturns += $returnsByStatus['completed'] ?? 0;

        return [
            'total_orders'    => $totalOrders,
            'total_returns'   => $totalReturns,
            'approved_returns'=> (int) $approvedReturns,
            'return_rate_pct' => $totalOrders > 0 ? round(($totalReturns / $totalOrders) * 100, 2) : 0,
            'by_status'       => $returnsByStatus,
        ];
    }

    // ── 7. Affiliate performance ──────────────────────────────────

    public function affiliatePerformance(
        ?string $from = null,
        ?string $to   = null
    ): array {
        return DB::table('affiliate_commissions as ac')
            ->join('affiliates as a', 'ac.affiliate_id', '=', 'a.id')
            ->join('users as u',      'a.user_id',        '=', 'u.id')
            ->when($from, fn ($q) => $q->whereDate('ac.created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('ac.created_at', '<=', $to))
            ->select([
                'ac.affiliate_id',
                'a.affiliate_code',
                'u.name as affiliate_name',
                'u.email as affiliate_email',
                DB::raw('COUNT(DISTINCT ac.order_id) as referred_orders'),
                DB::raw('SUM(ac.order_grand_total) as gmv'),
                DB::raw('SUM(ac.commission_amount) as total_commission'),
                DB::raw("SUM(CASE WHEN ac.status = 'earned' THEN ac.commission_amount ELSE 0 END) as earned_commission"),
                DB::raw("SUM(CASE WHEN ac.status = 'pending' THEN ac.commission_amount ELSE 0 END) as pending_commission"),
            ])
            ->groupBy('ac.affiliate_id', 'a.affiliate_code', 'affiliate_name', 'affiliate_email')
            ->orderByDesc('total_commission')
            ->get()
            ->map(fn ($r) => [
                'affiliate_id'       => $r->affiliate_id,
                'affiliate_code'     => $r->affiliate_code,
                'affiliate_name'     => $r->affiliate_name,
                'affiliate_email'    => $r->affiliate_email,
                'referred_orders'    => (int) $r->referred_orders,
                'gmv'                => round((float) $r->gmv, 2),
                'total_commission'   => round((float) $r->total_commission, 2),
                'earned_commission'  => round((float) $r->earned_commission, 2),
                'pending_commission' => round((float) $r->pending_commission, 2),
            ])
            ->toArray();
    }

    // ── Summary stats (for cards on the main reports page) ───────

    public function summaryStats(?string $from = null, ?string $to = null): array
    {
        $orders = DB::table('orders')
            ->whereNull('deleted_at')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->selectRaw("
                COUNT(*) as total_orders,
                SUM(CASE WHEN status NOT IN ('cancelled','refunded') THEN grand_total ELSE 0 END) as revenue,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            ")
            ->first();

        $newCustomers = DB::table('customers')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->count();

        $returnCount = DB::table('return_requests')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->count();

        return [
            'total_orders'  => (int) ($orders->total_orders ?? 0),
            'revenue'       => round((float) ($orders->revenue ?? 0), 2),
            'delivered'     => (int) ($orders->delivered ?? 0),
            'cancelled'     => (int) ($orders->cancelled ?? 0),
            'new_customers' => (int) $newCustomers,
            'returns'       => (int) $returnCount,
        ];
    }
}
