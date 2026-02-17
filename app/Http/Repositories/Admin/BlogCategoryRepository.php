<?php

namespace App\Http\Repositories\Admin;

use App\Models\BlogCategory;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Storage;

class BlogCategoryRepository
{
    public function getAll()
    {
        return BlogCategory::with('parent')->latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = BlogCategory::with('parent')->latest();

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = is_array($request->search) ? $request->search['value'] : $request->search;
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('meta_title', 'like', "%{$search}%")
                      ->orWhereHas('parent', fn($q) => $q->where('name', 'like', "%{$search}%"));
                });
            }
        }

        // Filter by parent
        if ($request->has('parent_id') && $request->parent_id !== '') {
            if ($request->parent_id === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        return DataTables::of($query)
            ->addIndexColumn()
            ->addColumn('parent_name', fn($row) => $row->parent?->name ?? 'N/A')
            ->make(true);
    }

    public function find($id)
    {
        return BlogCategory::findOrFail($id);
    }

    public function getParents($excludeId = null)
    {
        return BlogCategory::whereNull('parent_id')
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->get(['id', 'name']);
    }

    public function store(array $data, $socialImageFile = null)
    {
        if (empty($data['slug'])) {
            $data['slug'] = str()->slug($data['name']);
        }

        if ($socialImageFile) {
            $data['social_image'] = $socialImageFile->store('blog-categories', 'public');
        }

        return BlogCategory::create($data);
    }

    public function update($id, array $data, $socialImageFile = null)
    {
        $blogCategory = $this->find($id);

        if ($data['name'] !== $blogCategory->name && empty($data['slug'])) {
            $data['slug'] = str()->slug($data['name']);
        }

        if ($socialImageFile) {
            // Purani image delete karo
            if ($blogCategory->social_image) {
                Storage::disk('public')->delete($blogCategory->social_image);
            }
            $data['social_image'] = $socialImageFile->store('blog-categories', 'public');
        }

        $blogCategory->update($data);
        return $blogCategory;
    }

    public function delete($id)
    {
        $blogCategory = $this->find($id);

        if ($blogCategory->children()->count() > 0) {
            throw new \Exception('Cannot delete category with sub-categories.');
        }

        if ($blogCategory->social_image) {
            Storage::disk('public')->delete($blogCategory->social_image);
        }

        return $blogCategory->delete();
    }

    public function getStats()
    {
        return [
            'total'            => BlogCategory::count(),
            'with_parent'      => BlogCategory::whereNotNull('parent_id')->count(),
            'root_categories'  => BlogCategory::whereNull('parent_id')->count(),
        ];
    }
}