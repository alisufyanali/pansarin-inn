<?php

namespace App\Http\Repositories\Admin;

use App\Models\OrderReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderReviewRepository
{
    public function getAllForDataTable(Request $request)
    {
        $query = OrderReview::with(['order', 'customer'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('review', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($q) =>
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                  )
                  ->orWhereHas('order', fn ($q) =>
                      $q->where('order_number', 'like', "%{$search}%")
                  );
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        $reviews = $query->paginate($request->get('perPage', 10));

        return response()->json([
            'data'         => $reviews->map(fn ($r) => $this->format($r)),
            'total'        => $reviews->total(),
            'per_page'     => $reviews->perPage(),
            'current_page' => $reviews->currentPage(),
            'last_page'    => $reviews->lastPage(),
        ]);
    }

    public function find($id)
    {
        return OrderReview::with(['order', 'customer'])->findOrFail($id);
    }

    public function store(array $data): OrderReview
    {
        return OrderReview::create($data);
    }

    public function update($id, array $data): OrderReview
    {
        $review = $this->find($id);
        if (!empty($data['admin_reply']) && empty($review->replied_at)) {
            $data['replied_at'] = now();
        }
        $review->update($data);
        return $review;
    }

    public function delete($id): bool
    {
        return $this->find($id)->delete();
    }

    public function updateStatus($id, string $status): OrderReview
    {
        $review = $this->find($id);
        $review->update(['status' => $status]);
        return $review;
    }

    public function getStats(): array
    {
        return [
            'total'    => OrderReview::count(),
            'pending'  => OrderReview::where('status', 'pending')->count(),
            'approved' => OrderReview::where('status', 'approved')->count(),
            'rejected' => OrderReview::where('status', 'rejected')->count(),
            'avg_rating' => round(OrderReview::avg('rating') ?? 0, 1),
        ];
    }

    private function format(OrderReview $r): array
    {
        return [
            'id'          => $r->id,
            'rating'      => $r->rating,
            'review'      => $r->review,
            'status'      => $r->status,
            'admin_reply' => $r->admin_reply,
            'replied_at'  => $r->replied_at,
            'created_at'  => $r->created_at,
            'order'       => $r->order ? ['id' => $r->order->id, 'order_number' => $r->order->order_number] : null,
            'customer'    => $r->customer ? [
                'id'         => $r->customer->id,
                'first_name' => $r->customer->first_name,
                'last_name'  => $r->customer->last_name,
                'phone'      => $r->customer->phone,
            ] : null,
        ];
    }
}
