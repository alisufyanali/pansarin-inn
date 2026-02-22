<?php

namespace App\Http\Repositories\Admin;

use App\Models\Category;
use Illuminate\Support\Facades\Storage;

class CategoryRepository
{
    public function getAll()
    {
        return Category::with('parent')->latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = Category::with('parent:id,name')
            ->select('id', 'name', 'slug', 'image', 'status', 'parent_id', 'created_at', 'updated_at');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('parent', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status === 'active');
        }

        // Parent filter
        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        // Sorting
        $sortBy = $request->get('sortBy', 'created_at');
        $sortOrder = $request->get('sortOrder', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('perPage', 10);
        $page = $request->get('page', 1);

        $categories = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform data
        $transformedData = $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image' => $category->image,
                'status' => $category->status,
                'parent_id' => $category->parent_id,
                'parent' => $category->parent,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'total' => $categories->total(),
            'per_page' => $categories->perPage(),
            'current_page' => $categories->currentPage(),
            'last_page' => $categories->lastPage(),
        ]);
    }

    public function find($id)
    {
        return Category::findOrFail($id);
    }

    public function getParents($excludeId = null)
    {
        return Category::orderBy('name')
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->get(['id', 'name']);
    }

    public function store(array $data, $imageFile = null, $socialImageFile = null)
    {
        $data['slug'] = str()->slug($data['name']);

        if ($imageFile) {
            $data['image'] = $imageFile->store('categories', 'public');
        }

        if ($socialImageFile) {
            $data['social_image'] = $socialImageFile->store('categories/social', 'public');
        }

        return Category::create($data);
    }

    public function update($id, array $data, $imageFile = null, $socialImageFile = null)
    {
        $category = $this->find($id);

        if ($data['name'] !== $category->name) {
            $data['slug'] = str()->slug($data['name']);
        }

        // Handle main image
        if ($imageFile) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $imageFile->store('categories', 'public');
        } else {
            // Don't update image field if no new image provided
            unset($data['image']);
        }

        // Handle social image
        if ($socialImageFile) {
            if ($category->social_image) {
                Storage::disk('public')->delete($category->social_image);
            }
            $data['social_image'] = $socialImageFile->store('categories/social', 'public');
        } else {
            // Don't update social_image field if no new image provided
            unset($data['social_image']);
        }

        $category->update($data);

        return $category;
    }

    public function delete($id)
    {
        $category = $this->find($id);

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        if ($category->social_image) {
            Storage::disk('public')->delete($category->social_image);
        }

        return $category->delete();
    }

    public function getStats()
    {
        return [
            'total' => Category::count(),
            'active' => Category::where('status', true)->count(),
            'withParent' => Category::whereNotNull('parent_id')->count(),
            'topLevel' => Category::whereNull('parent_id')->count(),
        ];
    }
}
