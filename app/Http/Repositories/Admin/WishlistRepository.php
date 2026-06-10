<?php

namespace App\Http\Repositories\Admin;

use App\Models\Wishlist;

class WishlistRepository
{
    public function getAllForDataTable($request)
    {
        $query = Wishlist::with(['user:id,name,email', 'product:id,name,thumbnail', 'variant:id,sku,value,attributes']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('user_id'))    $query->where('user_id', $request->user_id);
        if ($request->filled('product_id')) $query->where('product_id', $request->product_id);

        $sortBy    = $request->get('sortBy', 'created_at');
        $sortOrder = $request->get('sortOrder', 'desc');
        $allowed   = ['id', 'user_id', 'product_id', 'created_at'];
        $query->orderBy(in_array($sortBy, $allowed) ? $sortBy : 'created_at', $sortOrder);

        $perPage   = (int) $request->get('perPage', 10);
        $page      = (int) $request->get('page', 1);
        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data'         => $paginated->items(),
            'total'        => $paginated->total(),
            'per_page'     => $paginated->perPage(),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
        ]);
    }

    public function find($id)
    {
        return Wishlist::with(['user', 'product', 'variant'])->findOrFail($id);
    }

    public function store(array $data)
    {
        $exists = Wishlist::where('user_id', $data['user_id'])
            ->where('product_id', $data['product_id'])
            ->where('product_variant_id', $data['product_variant_id'] ?? null)
            ->exists();

        if ($exists) {
            throw new \Exception('This product is already in the user\'s wishlist.');
        }

        return Wishlist::create($data);
    }

    public function delete($id)
    {
        return Wishlist::findOrFail($id)->delete();
    }

    public function bulkDelete(array $ids)
    {
        return Wishlist::whereIn('id', $ids)->delete();
    }

    public function getStats()
    {
        return [
            'total'           => Wishlist::count(),
            'unique_users'    => Wishlist::distinct('user_id')->count('user_id'),
            'unique_products' => Wishlist::distinct('product_id')->count('product_id'),
        ];
    }
}
