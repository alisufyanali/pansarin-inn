<?php

namespace App\Http\Repositories\Admin;

use App\Models\ProductVariant;
use Illuminate\Support\Facades\Log;

class ProductVariantRepository
{
    /**
     * Get all variants
     */
    public function getAll()
    {
        return ProductVariant::with('product')->latest()->get();
    }

    /**
     * Get all variants for DataTable
     */
    public function getAllForDataTable($request)
    {
        $query = ProductVariant::with('product')->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('sku', 'like', "%{$search}%")
                      ->orWhere('price', 'like', "%{$search}%")
                      ->orWhere('stock', 'like', "%{$search}%")
                      ->orWhereHas('product', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('sku', 'like', "%{$search}%")
                          ->orWhere('price', 'like', "%{$search}%")
                          ->orWhere('stock', 'like', "%{$search}%")
                          ->orWhereHas('product', function($q) use ($search) {
                              $q->where('name', 'like', "%{$search}%");
                          });
                    });
                }
            }
        }
        
        // Additional filters
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status === 'active');
        }
        
        if ($request->has('product_id') && $request->product_id !== '') {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('is_default') && $request->is_default !== '') {
            $query->where('is_default', $request->is_default === 'yes');
        }

        if ($request->has('stock_status') && $request->stock_status !== '') {
            if ($request->stock_status === 'in_stock') {
                $query->where('stock', '>', 0);
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            }
        }

        return $query;
    }

    /**
     * Find variant by ID
     */
    public function find($id)
    {
        return ProductVariant::with('product')->findOrFail($id);
    }

    /**
     * Create new variant
     */
    public function store(array $data)
    {
        try {
            // Ensure attributes is stored as JSON string
            if (isset($data['attributes']) && is_array($data['attributes'])) {
                $data['attributes'] = json_encode($data['attributes']);
            }

            return ProductVariant::create($data);
        } catch (\Exception $e) {
            Log::error('Failed to create variant: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update variant
     */
    public function update($id, array $data)
    {
        try {
            $variant = ProductVariant::findOrFail($id);

            // Ensure attributes is stored as JSON string
            if (isset($data['attributes']) && is_array($data['attributes'])) {
                $data['attributes'] = json_encode($data['attributes']);
            }

            $variant->update($data);
            return $variant;
        } catch (\Exception $e) {
            Log::error('Failed to update variant: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete variant
     */
    public function delete($id)
    {
        try {
            return ProductVariant::destroy($id);
        } catch (\Exception $e) {
            Log::error('Failed to delete variant: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get stats
     */
    public function getStats()
    {
        return [
            'total' => ProductVariant::count(),
            'active' => ProductVariant::where('status', true)->count(),
            'inactive' => ProductVariant::where('status', false)->count(),
            'in_stock' => ProductVariant::where('stock', '>', 0)->count(),
            'out_of_stock' => ProductVariant::where('stock', '<=', 0)->count(),
        ];
    }
}
