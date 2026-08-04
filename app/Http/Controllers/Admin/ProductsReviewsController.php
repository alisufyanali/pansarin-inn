<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ProductReviewRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductsReviewsController extends Controller
{
    public function __construct(protected ProductReviewRepository $repo)
    {
        $this->middleware('permission:reviews.view')->only(['index', 'getData']);
        $this->middleware('permission:reviews.moderate')->only(['updateStatus', 'bulkAction', 'reply', 'toggleHomepage']);
        $this->middleware('permission:reviews.delete')->only(['destroy', 'bulkAction']);
    }

    // GET /admin/reviews
    public function index()
    {
        return Inertia::render('Admin/ProductsReviews/Index', [
            'stats' => $this->repo->getStats(),
        ]);
    }

    // GET /admin/reviews-data  (DataTable AJAX)
    public function getData(Request $request)
    {
        try {
            return $this->repo->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Reviews getData: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
        }
    }

    // PATCH /admin/reviews/{review}/status
    public function updateStatus(Request $request, string $id)
    {
        try {
            $request->validate(['status' => 'required|in:approved,pending']);
            $this->repo->updateStatus($id, $request->status === 'approved');
            return back()->with('success', 'Review status updated.');
        } catch (\Exception $e) {
            Log::error('Reviews updateStatus: ' . $e->getMessage());
            return back()->with('error', 'Failed to update status.');
        }
    }

    // POST /admin/reviews/bulk-action
    // Body: { action: 'approve'|'reject'|'delete', ids: int[] }
    public function bulkAction(Request $request)
    {
        try {
            $request->validate([
                'action' => 'required|in:approve,reject,delete',
                'ids'    => 'required|array|min:1',
                'ids.*'  => 'integer',
            ]);

            $ids    = $request->ids;
            $action = $request->action;

            if ($action === 'delete') {
                $count = $this->repo->bulkDelete($ids);
                return back()->with('success', "{$count} review(s) deleted.");
            }

            $status = $action === 'approve';
            $count  = $this->repo->bulkUpdateStatus($ids, $status);
            $label  = $status ? 'approved' : 'rejected';
            return back()->with('success', "{$count} review(s) {$label}.");
        } catch (\Exception $e) {
            Log::error('Reviews bulkAction: ' . $e->getMessage());
            return back()->with('error', 'Bulk action failed.');
        }
    }

    // POST /admin/reviews/{id}/reply
    public function reply(Request $request, string $id)
    {
        try {
            $request->validate(['reply' => 'required|string|max:2000']);
            $this->repo->reply($id, $request->reply);
            return back()->with('success', 'Reply saved.');
        } catch (\Exception $e) {
            Log::error('Reviews reply: ' . $e->getMessage());
            return back()->with('error', 'Failed to save reply.');
        }
    }

    // PATCH /admin/reviews/{id}/toggle-homepage
    public function toggleHomepage(Request $request, string $id)
    {
        try {
            $review = $this->repo->find($id);
            $review->update(['show_on_homepage' => (bool) $request->show_on_homepage]);
            return response()->json(['success' => true, 'show_on_homepage' => $review->show_on_homepage]);
        } catch (\Exception $e) {
            Log::error('Reviews toggleHomepage: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update.'], 500);
        }
    }

    // DELETE /admin/reviews/{id}
    public function destroy(string $id)
    {
        try {
            $this->repo->delete($id);
            return redirect()->route('admin.reviews.index')->with('success', 'Review deleted.');
        } catch (\Exception $e) {
            Log::error('Reviews destroy: ' . $e->getMessage());
            return redirect()->route('admin.reviews.index')->with('error', 'Failed to delete review.');
        }
    }
}
