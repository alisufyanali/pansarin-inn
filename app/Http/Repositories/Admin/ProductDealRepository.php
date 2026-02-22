<?php

namespace App\Http\Repositories\Admin;

use App\Models\Deal;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductDealRepository
{
    public function getAll()
    {
        return Deal::withCount('products')->latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = Deal::withCount('products');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('deal_type') && $request->deal_type) {
            $query->where('deal_type', $request->deal_type);
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
        return Deal::findOrFail($id);
    }

    public function store(array $data, $imageFile = null)
    {
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['title']);
        }

        if ($imageFile) {
            $data['image'] = $imageFile->store('deals', 'public');
        }

        $products = $data['products'] ?? [];
        unset($data['products']);

        $deal = Deal::create($data);

        // Attach products with pivot data
        if (! empty($products)) {
            $syncData = [];
            foreach ($products as $product) {
                $syncData[$product['id']] = [
                    'custom_discount' => $product['custom_discount'] ?? null,
                    'stock_limit' => $product['stock_limit'] ?? null,
                ];
            }
            $deal->products()->sync($syncData);
        }

        return $deal;
    }

    public function update($id, array $data, $imageFile = null)
    {
        $deal = $this->find($id);

        if ($data['title'] !== $deal->title && empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['title'], $deal->id);
        }

        if ($imageFile) {
            if ($deal->image) {
                Storage::disk('public')->delete($deal->image);
            }
            $data['image'] = $imageFile->store('deals', 'public');
        }

        $products = $data['products'] ?? [];
        unset($data['products']);

        $deal->update($data);

        // Sync products with pivot data
        if (isset($products)) {
            $syncData = [];
            foreach ($products as $product) {
                $syncData[$product['id']] = [
                    'custom_discount' => $product['custom_discount'] ?? null,
                    'stock_limit' => $product['stock_limit'] ?? null,
                ];
            }
            $deal->products()->sync($syncData);
        }

        return $deal;
    }

    public function delete($id)
    {
        $deal = $this->find($id);

        if ($deal->image) {
            Storage::disk('public')->delete($deal->image);
        }

        // Detach all products
        $deal->products()->detach();

        return $deal->delete();
    }

    public function toggleStatus($id)
    {
        $deal = $this->find($id);
        $deal->update(['is_active' => ! $deal->is_active]);

        return $deal;
    }

    public function duplicate($id)
    {
        $deal = $this->find($id);

        $newDeal = $deal->replicate();
        $newDeal->title = $deal->title.' (Copy)';
        $newDeal->slug = $this->generateUniqueSlug($newDeal->title);
        $newDeal->is_active = false;
        $newDeal->current_uses = 0;
        $newDeal->save();

        // Copy products with pivot data
        foreach ($deal->products as $product) {
            $newDeal->products()->attach($product->id, [
                'custom_discount' => $product->pivot->custom_discount,
                'stock_limit' => $product->pivot->stock_limit,
            ]);
        }

        return $newDeal;
    }

    public function getStats()
    {
        return [
            'total' => Deal::count(),
            'active' => Deal::active()->count(),
            'featured' => Deal::featured()->count(),
            'expired' => Deal::expired()->count(),
        ];
    }

    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        while (
            Deal::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
