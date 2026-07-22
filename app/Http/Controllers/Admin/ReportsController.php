<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ReportsRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function __construct(protected ReportsRepository $repo)
    {
        $this->middleware('permission:view.reports')->only(['index', 'summary', 'salesOverTime', 'topProducts', 'topCustomers', 'categorySales', 'paymentBreakdown', 'returnsRate', 'affiliatePerformance']);
        $this->middleware('permission:export.reports')->only(['export']);
    }

    /**
     * GET /admin/reports
     * Main page — serves the React shell; data loaded client-side via JSON endpoints.
     */
    public function index()
    {
        return Inertia::render('Admin/Reports/Index');
    }

    // ── JSON data endpoints (all accept ?from=&to=&category_id=&payment_method=) ──

    public function summary(Request $request)
    {
        try {
            return response()->json($this->repo->summaryStats(
                $request->get('from'),
                $request->get('to')
            ));
        } catch (\Exception $e) {
            Log::error('Reports summary: ' . $e->getMessage());
            return response()->json(['error' => 'Failed'], 500);
        }
    }

    public function salesOverTime(Request $request)
    {
        try {
            return response()->json($this->repo->salesOverTime(
                $request->get('period', 'daily'),
                $request->get('from'),
                $request->get('to'),
                $request->get('payment_method')
            ));
        } catch (\Exception $e) {
            Log::error('Reports salesOverTime: ' . $e->getMessage());
            return response()->json(['error' => 'Failed'], 500);
        }
    }

    public function topProducts(Request $request)
    {
        try {
            return response()->json($this->repo->topProducts(
                $request->get('from'),
                $request->get('to'),
                $request->filled('category_id') ? (int) $request->category_id : null
            ));
        } catch (\Exception $e) {
            Log::error('Reports topProducts: ' . $e->getMessage());
            return response()->json(['error' => 'Failed'], 500);
        }
    }

    public function topCustomers(Request $request)
    {
        try {
            return response()->json($this->repo->topCustomers(
                $request->get('from'),
                $request->get('to')
            ));
        } catch (\Exception $e) {
            Log::error('Reports topCustomers: ' . $e->getMessage());
            return response()->json(['error' => 'Failed'], 500);
        }
    }

    public function categorySales(Request $request)
    {
        try {
            return response()->json($this->repo->categorySales(
                $request->get('from'),
                $request->get('to')
            ));
        } catch (\Exception $e) {
            Log::error('Reports categorySales: ' . $e->getMessage());
            return response()->json(['error' => 'Failed'], 500);
        }
    }

    public function paymentBreakdown(Request $request)
    {
        try {
            return response()->json($this->repo->paymentBreakdown(
                $request->get('from'),
                $request->get('to')
            ));
        } catch (\Exception $e) {
            Log::error('Reports paymentBreakdown: ' . $e->getMessage());
            return response()->json(['error' => 'Failed'], 500);
        }
    }

    public function returnsRate(Request $request)
    {
        try {
            return response()->json($this->repo->returnsRate(
                $request->get('from'),
                $request->get('to')
            ));
        } catch (\Exception $e) {
            Log::error('Reports returnsRate: ' . $e->getMessage());
            return response()->json(['error' => 'Failed'], 500);
        }
    }

    public function affiliatePerformance(Request $request)
    {
        try {
            return response()->json($this->repo->affiliatePerformance(
                $request->get('from'),
                $request->get('to')
            ));
        } catch (\Exception $e) {
            Log::error('Reports affiliatePerformance: ' . $e->getMessage());
            return response()->json(['error' => 'Failed'], 500);
        }
    }

    /**
     * GET /admin/reports/export?type=sales_over_time&format=csv&...
     * CSV export — data is assembled server-side as plain text.
     * PDF export is handled client-side via jspdf-autotable (no server load).
     */
    public function export(Request $request)
    {
        $request->validate([
            'type'   => 'required|in:sales_over_time,top_products,top_customers,category_sales,payment_breakdown,returns_rate,affiliate_performance',
            'format' => 'required|in:csv',
        ]);

        $from = $request->get('from');
        $to   = $request->get('to');

        [$headers, $rows, $filename] = match ($request->type) {
            'sales_over_time' => [
                ['Period', 'Orders', 'Revenue (PKR)'],
                collect($this->repo->salesOverTime($request->get('period', 'daily'), $from, $to)['rows'])
                    ->map(fn ($r) => [$r['period'], $r['orders'], $r['revenue']])->toArray(),
                'sales-over-time',
            ],
            'top_products' => [
                ['Product', 'Units Sold', 'Revenue (PKR)'],
                collect($this->repo->topProducts($from, $to, $request->filled('category_id') ? (int) $request->category_id : null))
                    ->map(fn ($r) => [$r['product_name'], $r['units_sold'], $r['revenue']])->toArray(),
                'top-products',
            ],
            'top_customers' => [
                ['Customer', 'Phone', 'Email', 'Orders', 'Total Spent (PKR)'],
                collect($this->repo->topCustomers($from, $to))
                    ->map(fn ($r) => [$r['customer_name'], $r['phone'], $r['email'], $r['order_count'], $r['total_spent']])->toArray(),
                'top-customers',
            ],
            'category_sales' => [
                ['Category', 'Units Sold', 'Revenue (PKR)', 'Orders'],
                collect($this->repo->categorySales($from, $to))
                    ->map(fn ($r) => [$r['category_name'], $r['units_sold'], $r['revenue'], $r['orders']])->toArray(),
                'category-sales',
            ],
            'payment_breakdown' => [
                ['Payment Method', 'Orders', 'Revenue (PKR)'],
                collect($this->repo->paymentBreakdown($from, $to))
                    ->map(fn ($r) => [$r['payment_method'], $r['order_count'], $r['revenue']])->toArray(),
                'payment-breakdown',
            ],
            'returns_rate' => [
                ['Metric', 'Value'],
                (function () use ($from, $to) {
                    $d = $this->repo->returnsRate($from, $to);
                    return [
                        ['Total Orders',     $d['total_orders']],
                        ['Total Returns',    $d['total_returns']],
                        ['Approved Returns', $d['approved_returns']],
                        ['Return Rate (%)',  $d['return_rate_pct']],
                    ];
                })(),
                'returns-rate',
            ],
            'affiliate_performance' => [
                ['Affiliate', 'Code', 'Referred Orders', 'GMV (PKR)', 'Total Commission (PKR)', 'Earned', 'Pending'],
                collect($this->repo->affiliatePerformance($from, $to))
                    ->map(fn ($r) => [$r['affiliate_name'], $r['affiliate_code'], $r['referred_orders'], $r['gmv'], $r['total_commission'], $r['earned_commission'], $r['pending_commission']])->toArray(),
                'affiliate-performance',
            ],
        };

        $csvContent = implode("\n", array_map(
            fn ($row) => implode(',', array_map(fn ($cell) => '"' . str_replace('"', '""', $cell) . '"', $row)),
            array_merge([$headers], $rows)
        ));

        $dateTag  = ($from && $to) ? "-{$from}-to-{$to}" : ('-' . now()->format('Y-m-d'));
        $fileName = "{$filename}{$dateTag}.csv";

        return response($csvContent, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }
}
