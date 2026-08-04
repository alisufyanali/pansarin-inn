<?php

namespace App\Http\Repositories\Admin;

use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewRepository
{
    public function getAllForDataTable(Request $request)
    {
        $query = ProductReview::with(['product:id,name,slug,thumbnail'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('comment', 'like', "%{$search}%")
                  ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        // status filter: 'approved' | 'pending'
        if ($request->filled('status')) {
            $query->where('status', $request->status === 'approved');
        }

        if ($request->filled('is_verified')) {
            $query->where('is_verified', (bool) $request->is_verified);
        }

        if ($request->filled('rating')) {
            $query->where('rating', (int) $request->rating);
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

    public function find(int|string $id): ProductReview
    {
        return ProductReview::with(['product:id,name,slug'])->findOrFail($id);
    }

    public function updateStatus(int|string $id, bool $status): ProductReview
    {
        $review = $this->find($id);
        $review->update(['status' => $status]);
        return $review;
    }

    public function bulkUpdateStatus(array $ids, bool $status): int
    {
        return ProductReview::whereIn('id', $ids)->update(['status' => $status]);
    }

    public function reply(int|string $id, string $replyText): ProductReview
    {
        $review = $this->find($id);
        $review->update([
            'admin_reply'      => $replyText,
            'admin_replied_at' => now(),
        ]);
        return $review;
    }

    public function delete(int|string $id): bool
    {
        return $this->find($id)->delete(); // soft delete
    }

    public function bulkDelete(array $ids): int
    {
        return ProductReview::whereIn('id', $ids)->delete();
    }

    public function getStats(): array
    {
        return [
            'total'    => ProductReview::count(),
            'approved' => ProductReview::where('status', true)->count(),
            'pending'  => ProductReview::where('status', false)->count(),
            'verified' => ProductReview::where('is_verified', true)->count(),
        ];
    }

    public function format(ProductReview $r): array
    {
        return [
            'id'             => $r->id,
            'customer_name'  => $r->customer_name,
            'customer_email' => $r->customer_email,
            'title'          => $r->title,
            'rating'         => $r->rating,
            'comment'        => $r->comment,
            'images'         => collect($r->images ?? [])->map(fn ($img) => asset('storage/' . $img))->values(),
            'helpful_count'  => (int) $r->helpful_count,
            'is_verified'    => (bool) $r->is_verified,
            'status'         => $r->status ? 'approved' : 'pending',
            'admin_reply'    => $r->admin_reply,
            'admin_replied_at' => $r->admin_replied_at?->toDateTimeString(),
            'show_on_homepage' => (bool) $r->show_on_homepage,
            'created_at'     => $r->created_at,
            'product'        => $r->product ? [
                'id'        => $r->product->id,
                'name'      => $r->product->name,
                'slug'      => $r->product->slug,
                'thumbnail' => $r->product->thumbnail ? asset('storage/' . $r->product->thumbnail) : null,
            ] : null,
        ];
    }
}
