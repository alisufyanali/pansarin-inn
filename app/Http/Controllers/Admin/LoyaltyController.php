<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\LoyaltyRepository;
use App\Models\GeneralSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LoyaltyController extends Controller
{
    public function __construct(protected LoyaltyRepository $repo)
    {
        $this->middleware('permission:view.loyalty')->only(['index', 'getData', 'show', 'customerHistory']);
        $this->middleware('permission:edit.loyalty')->only(['adjust']);
        $this->middleware('permission:view.loyalty-settings')->only(['settings']);
        $this->middleware('permission:edit.loyalty-settings')->only(['updateSettings']);
    }

    /**
     * GET /admin/loyalty
     * Customer list with balances.
     */
    public function index()
    {
        return Inertia::render('Admin/Loyalty/Index', [
            'stats' => $this->repo->getStats(),
        ]);
    }

    /**
     * GET /admin/loyalty-data
     * DataTableWrapper paginated endpoint.
     */
    public function getData(Request $request)
    {
        try {
            return $this->repo->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Loyalty getData: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
        }
    }

    /**
     * GET /admin/loyalty/{customerId}
     * Per-customer ledger page.
     */
    public function show(string $customerId)
    {
        try {
            // Pass initial data server-side; history pagination fetched client-side via customerHistory
            $data = $this->repo->getCustomerWithHistory((int) $customerId, request());

            return Inertia::render('Admin/Loyalty/Show', [
                'customer'     => $data['customer'],
                'balance'      => $data['balance'],
                'transactions' => $data['transactions'],
                'meta'         => $data['meta'],
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.loyalty.index')->with('error', 'Customer not found.');
        }
    }

    /**
     * GET /admin/loyalty/{customerId}/history
     * AJAX: paginated transaction history (used by client-side pagination on Show page).
     */
    public function customerHistory(Request $request, string $customerId)
    {
        try {
            $data = $this->repo->getCustomerWithHistory((int) $customerId, $request);

            return response()->json([
                'transactions' => $data['transactions'],
                'meta'         => $data['meta'],
                'balance'      => $data['balance'],
            ]);
        } catch (\Exception $e) {
            Log::error('Loyalty customerHistory: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load history'], 500);
        }
    }

    /**
     * POST /admin/loyalty/{customerId}/adjust
     * Manual add/deduct points.
     */
    public function adjust(Request $request, string $customerId)
    {
        try {
            $validated = $request->validate([
                'points'    => 'required|integer|not_in:0',
                'reason'    => 'required|string|max:255',
                'reference' => 'nullable|string|max:255',
            ]);

            $this->repo->adjust(
                (int) $customerId,
                (int) $validated['points'],
                $validated['reason'],
                $validated['reference'] ?? null
            );

            $action  = $validated['points'] > 0 ? 'credited' : 'deducted';
            $abs     = abs($validated['points']);

            return back()->with('success', "{$abs} points {$action} successfully.");
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Loyalty adjust: ' . $e->getMessage());
            return back()->with('error', 'Failed to adjust points.');
        }
    }

    /**
     * GET /admin/loyalty/settings
     * Points earning rules config page.
     */
    public function settings()
    {
        $keys = [
            'loyalty_points_per_rupee',
            'loyalty_min_order_amount',
            'loyalty_points_expiry_days',
            'loyalty_redemption_rate',
        ];

        $defaults = [
            'loyalty_points_per_rupee'     => '0.01',
            'loyalty_min_order_amount'     => '0',
            'loyalty_points_expiry_days'   => '0',
            'loyalty_redemption_rate'      => '0',
        ];

        $saved    = GeneralSetting::whereIn('type', $keys)->pluck('value', 'type')->all();
        $settings = array_merge($defaults, $saved);

        return Inertia::render('Admin/Loyalty/Settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * POST /admin/loyalty/settings
     * Save points earning config into general_settings table.
     */
    public function updateSettings(Request $request)
    {
        try {
            $validated = $request->validate([
                'loyalty_points_per_rupee'   => 'required|numeric|min:0|max:100',
                'loyalty_min_order_amount'   => 'required|numeric|min:0',
                'loyalty_points_expiry_days' => 'required|integer|min:0',
                'loyalty_redemption_rate'    => 'required|numeric|min:0',
            ]);

            foreach ($validated as $key => $value) {
                GeneralSetting::updateOrCreate(
                    ['type' => $key],
                    ['value' => $value]
                );
            }

            return back()->with('success', 'Loyalty points settings updated successfully.');
        } catch (\Exception $e) {
            Log::error('Loyalty updateSettings: ' . $e->getMessage());
            return back()->with('error', 'Failed to save settings.');
        }
    }
}
