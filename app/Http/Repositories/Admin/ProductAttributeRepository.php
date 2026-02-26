<?php

namespace App\Http\Repositories\Admin;

use App\Models\Attribute;

class ProductAttributeRepository
{
    public function getAll()
    {
        return Attribute::with(['values', 'category'])->latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = Attribute::with(['values', 'category'])->withCount('values')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = $request->get('perPage', 10);
        $page = $request->get('page', 1);

        $attributes = $query->paginate($perPage, ['*'], 'page', $page);

        $transformedData = $attributes->map(function ($attribute) {
            return [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'slug' => $attribute->slug,
                'category' => $attribute->category ? [
                    'id' => $attribute->category->id,
                    'name' => $attribute->category->name,
                ] : null,
                'values' => $attribute->values,
                'values_count' => $attribute->values_count,
                'created_at' => $attribute->created_at,
                'updated_at' => $attribute->updated_at,
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'total' => $attributes->total(),
            'per_page' => $attributes->perPage(),
            'current_page' => $attributes->currentPage(),
            'last_page' => $attributes->lastPage(),
        ]);
    }

    public function find($id)
    {
        return Attribute::findOrFail($id);
    }

    public function store(array $data)
    {
        if (empty($data['slug'])) {
            $data['slug'] = str()->slug($data['name']);
        }

        return Attribute::create($data);
    }

    public function update($id, array $data)
    {
        $attribute = $this->find($id);

        if ($data['name'] !== $attribute->name && empty($data['slug'])) {
            $data['slug'] = str()->slug($data['name']);
        }

        $attribute->update($data);

        return $attribute;
    }

    public function delete($id)
    {
        $attribute = $this->find($id);

        return $attribute->delete();
    }

    public function getStats()
    {
        return [
            'total' => Attribute::count(),
            'with_values' => Attribute::has('values')->count(),
        ];
    }
}
