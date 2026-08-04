<?php

namespace App\Http\Repositories\Admin;

use App\Models\SiteReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SiteReviewRepository
{
    public function getAllForDataTable(Request $request)
    {
        $query = SiteReview::latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reviewer_name',  'like', "%{$search}%")
                  ->orWhere('reviewer_email', 'like', "%{$search}%")
                  ->orWhere('order_number',   'like', "%{$search}%")
                  ->orWhere('comment',        'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        $reviews = $query->paginate(min((int) $request->get('perPage', 15), 100));

        return response()->json([
            'data'         => $reviews->map(fn ($r) => $this->format($r)),
            'total'        => $reviews->total(),
            'per_page'     => $reviews->perPage(),
            'current_page' => $reviews->currentPage(),
            'last_page'    => $reviews->lastPage(),
        ]);
    }

    public function find(int|string $id): SiteReview
    {
        return SiteReview::findOrFail($id);
    }

    public function updateStatus(int|string $id, string $status): SiteReview
    {
        $review = $this->find($id);
        $review->update(['status' => $status]);
        return $review;
    }

    public function delete(int|string $id): bool
    {
        return $this->find($id)->delete();
    }

    public function getStats(): array
    {
        return [
            'total'      => SiteReview::count(),
            'pending'    => SiteReview::where('status', 'pending')->count(),
            'approved'   => SiteReview::where('status', 'approved')->count(),
            'rejected'   => SiteReview::where('status', 'rejected')->count(),
            'avg_rating' => round(SiteReview::avg('rating') ?? 0, 1),
        ];
    }

    private function format(SiteReview $r): array
    {
        return [
            'id'             => $r->id,
            'reviewer_name'  => $r->reviewer_name,
            'reviewer_email' => $r->reviewer_email,
            'order_number'   => $r->order_number,
            'rating'         => $r->rating,
            'comment'        => $r->comment,
            'image'          => $r->image ? asset('storage/' . $r->image) : null,
            'status'         => $r->status,
            'admin_note'     => $r->admin_note,
            'created_at'     => $r->created_at,
        ];
    }
}
