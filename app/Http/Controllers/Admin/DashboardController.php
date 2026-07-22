<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\DashboardRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(protected DashboardRepository $repo)
    {
        // Dashboard is viewable by any authenticated+verified admin user.
        // Individual KPI cards are guarded server-side by what data we choose to include.
    }

    /**
     * GET /admin/dashboard — main page, passes all KPI data server-side (fast initial paint).
     */
    public function index(Request $request)
    {
        try {
            return Inertia::render('dashboard', [
                'kpis'     => $this->repo->getKpis(),
                'trend'    => $this->repo->revenueTrend(),
                'activity' => $this->repo->recentActivity(),
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard index error: ' . $e->getMessage());

            // Fail gracefully — show empty dashboard rather than 500
            return Inertia::render('dashboard', [
                'kpis'     => [],
                'trend'    => [],
                'activity' => [],
            ]);
        }
    }
}
