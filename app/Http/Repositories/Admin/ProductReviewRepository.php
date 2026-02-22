<?php

namespace App\Http\Repositories\Admin;

use App\Models\Order;
use App\Models\Review;

class ProductReviewRepository
{
    public function getAll()
    {
        return Review::with('product')->latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = Review::with(['product:id,name']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('comment', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filters
        if ($request->has('status') && $request->status !== null) {
            $query->where('status', $request->status);
        }

        if ($request->has('is_verified') && $request->is_verified !== null) {
            $query->where('is_verified', $request->is_verified);
        }

        if ($request->has('rating') && $request->rating) {
            $query->where('rating', $request->rating);
        }

        // Sorting
        $sortBy = $request->get('sortBy', 'created_at');
        $sortOrder = $request->get('sortOrder', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('perPage', 10);
        $page = $request->get('page', 1);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function find($id)
    {
        return Review::findOrFail($id);
    }

    public function store(array $data)
    {
        // Check if order number exists and belongs to this product
        $isVerified = false;
        if (! empty($data['order_number'])) {
            $order = Order::where('order_number', $data['order_number'])
                ->whereHas('items', function ($q) use ($data) {
                    $q->where('product_id', $data['product_id']);
                })
                ->first();

            $isVerified = $order ? true : false;
        }

        $data['is_verified'] = $isVerified;
        $data['status'] = $data['status'] ?? false; // Pending approval by default
        $data['user_id'] = auth()->id(); // If logged in

        return Review::create($data);
    }

    public function update($id, array $data)
    {
        $review = $this->find($id);

        // Re-verify if order number changed
        if (! empty($data['order_number']) && $data['order_number'] !== $review->order_number) {
            $order = Order::where('order_number', $data['order_number'])
                ->whereHas('items', function ($q) use ($data) {
                    $q->where('product_id', $data['product_id']);
                })
                ->first();

            $data['is_verified'] = $order ? true : false;
        }

        $review->update($data);

        return $review;
    }

    public function delete($id)
    {
        $review = $this->find($id);

        return $review->delete();
    }

    public function updateStatus($id, $status)
    {
        $review = $this->find($id);
        $review->update(['status' => $status]);

        return $review;
    }

    public function bulkDelete(array $ids)
    {
        return Review::whereIn('id', $ids)->delete();
    }

    public function getStats()
    {
        return [
            'total' => Review::count(),
            'verified' => Review::where('is_verified', true)->count(),
            'pending' => Review::where('status', false)->count(),
        ];
    }
}
