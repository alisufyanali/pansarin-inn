<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\SiteReviewRepository;
use App\Http\Requests\Admin\SiteReviewStatusRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SiteReviewController extends Controller
{
    public function __construct(protected SiteReviewRepository $repo)
    {
        $this->middleware('permission:view.site-reviews')->only(['index', 'getData', 'show']);
        $this->middleware('permission:edit.site-reviews')->only(['updateStatus']);
        $this->middleware('permission:delete.site-reviews')->only(['destroy']);
    }

    // GET /admin/site-reviews
    public function index()
    {
        return Inertia::render('Admin/SiteReviews/Index', [
            'stats' => $this->repo->getStats(),
        ]);
    }

    // GET /admin/site-reviews-data  (DataTable AJAX)
    public function getData(Request $request)
    {
        try {
            return $this->repo->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('SiteReview getData: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
        }
    }

    // GET /admin/site-reviews/{id}
    public function show(string $id)
    {
        try {
            return Inertia::render('Admin/SiteReviews/Show', [
                'review' => $this->repo->find($id),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.site-reviews.index')->with('error', 'Review not found.');
        }
    }

    // PATCH /admin/site-reviews/{id}/status
    public function updateStatus(SiteReviewStatusRequest $request, string $id)
    {
        try {
            $review = $this->repo->find($id);
            $review->update([
                'status'     => $request->status,
                'admin_note' => $request->admin_note ?? $review->admin_note,
            ]);
            return back()->with('success', 'Review status updated to ' . $request->status . '.');
        } catch (\Exception $e) {
            Log::error('SiteReview updateStatus: ' . $e->getMessage());
            return back()->with('error', 'Failed to update status.');
        }
    }

    // DELETE /admin/site-reviews/{id}
    public function destroy(string $id)
    {
        try {
            $this->repo->delete($id);
            return redirect()->route('admin.site-reviews.index')
                ->with('success', 'Review deleted successfully.');
        } catch (\Exception $e) {
            Log::error('SiteReview destroy: ' . $e->getMessage());
            return redirect()->route('admin.site-reviews.index')
                ->with('error', 'Failed to delete review.');
        }
    }
}
