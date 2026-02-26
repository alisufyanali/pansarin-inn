<?php

namespace App\Http\Repositories\Admin;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Yajra\DataTables\Facades\DataTables;

class CouponRepository
{
    /**
     * Get all coupons
     */
    public function getAll()
    {
        return Coupon::with(['product', 'category'])->latest()->get();
    }

    /**
     * Get DataTable data for coupons
     */
    public function getAllForDataTable(Request $request)
    {
        try {
            $query = Coupon::with(['product', 'category'])->latest();

            // Search handling
            if ($request->has('search') && $request->search !== '') {
                if (is_string($request->search)) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('code', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%")
                            ->orWhere('discount_type', 'like', "%{$search}%")
                            ->orWhere('apply_to', 'like', "%{$search}%");
                    });
                } elseif (is_array($request->search) && isset($request->search['value'])) {
                    $search = $request->search['value'];
                    if (! empty($search)) {
                        $query->where(function ($q) use ($search) {
                            $q->where('code', 'like', "%{$search}%")
                                ->orWhere('description', 'like', "%{$search}%")
                                ->orWhere('discount_type', 'like', "%{$search}%")
                                ->orWhere('apply_to', 'like', "%{$search}%");
                        });
                    }
                }
            }

            // Filters
            if ($request->has('discount_type') && $request->discount_type !== '') {
                $query->where('discount_type', $request->discount_type);
            }

            if ($request->has('apply_to') && $request->apply_to !== '') {
                $query->where('apply_to', $request->apply_to);
            }

            if ($request->has('is_active') && $request->is_active !== '') {
                $query->where('is_active', $request->is_active);
            }

            return DataTables::of($query)
                ->addColumn('product_name', function ($coupon) {
                    return $coupon->product ? $coupon->product->name : null;
                })
                ->addColumn('category_name', function ($coupon) {
                    return $coupon->category ? $coupon->category->name : null;
                })
                ->make(true);
        } catch (\Exception $e) {
            Log::error('Coupon DataTable error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Find coupon by ID
     */
    public function find($id)
    {
        return Coupon::with(['product', 'category'])->findOrFail($id);
    }

    /**
     * Create new coupon
     */
    public function store(array $data)
    {
        try {
            // Clean up product_id and category_id based on apply_to
            if ($data['apply_to'] !== 'product') {
                $data['product_id'] = null;
            }
            if ($data['apply_to'] !== 'category') {
                $data['category_id'] = null;
            }

            return Coupon::create($data);
        } catch (\Exception $e) {
            Log::error('Coupon creation error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update coupon
     */
    public function update($id, array $data)
    {
        try {
            $coupon = $this->find($id);

            // Clean up product_id and category_id based on apply_to
            if ($data['apply_to'] !== 'product') {
                $data['product_id'] = null;
            }
            if ($data['apply_to'] !== 'category') {
                $data['category_id'] = null;
            }

            $coupon->update($data);

            return $coupon;
        } catch (\Exception $e) {
            Log::error('Coupon update error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete coupon
     */
    public function delete($id)
    {
        try {
            $coupon = $this->find($id);

            return $coupon->delete();
        } catch (\Exception $e) {
            Log::error('Coupon deletion error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Toggle coupon active status
     */
    public function toggleStatus($id)
    {
        try {
            $coupon = $this->find($id);
            $coupon->is_active = ! $coupon->is_active;
            $coupon->save();

            return $coupon;
        } catch (\Exception $e) {
            Log::error('Coupon toggle status error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get coupon statistics
     */
    public function getStats()
    {
        return [
            'total' => Coupon::count(),
            'active' => Coupon::where('is_active', true)->count(),
            'percentage' => Coupon::where('discount_type', 'percentage')->count(),
            'fixed' => Coupon::where('discount_type', 'fixed')->count(),
            'expired' => Coupon::where('end_date', '<', now())->count(),
        ];
    }

    /**
     * Bulk delete coupons
     */
    public function bulkDelete(array $ids)
    {
        try {
            return Coupon::whereIn('id', $ids)->delete();
        } catch (\Exception $e) {
            Log::error('Coupon bulk delete error: '.$e->getMessage());
            throw $e;
        }
    }
}
