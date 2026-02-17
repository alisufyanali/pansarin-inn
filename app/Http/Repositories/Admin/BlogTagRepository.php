<?php

namespace App\Http\Repositories\Admin;

use App\Models\BlogTag;
use Yajra\DataTables\Facades\DataTables;

class BlogTagRepository
{
    public function getAll()
    {
        return BlogTag::latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = BlogTag::withCount('blogs')->latest();

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = is_array($request->search) ? $request->search['value'] : $request->search;
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
        }

        // Filter by status
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active);
        }

        return DataTables::of($query)
            ->addIndexColumn()
            ->addColumn('blogs_count', fn($row) => $row->blogs_count)
            ->make(true);
    }

    public function find($id)
    {
        return BlogTag::findOrFail($id);
    }

    public function store(array $data)
    {
        if (empty($data['slug'])) {
            $data['slug'] = str()->slug($data['name']);
        }

        // Set default color if not provided
        if (empty($data['color'])) {
            $data['color'] = '#3B82F6'; // Default blue color
        }

        // Set default is_active if not provided
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        return BlogTag::create($data);
    }

    public function update($id, array $data)
    {
        $blogTag = $this->find($id);

        if ($data['name'] !== $blogTag->name && empty($data['slug'])) {
            $data['slug'] = str()->slug($data['name']);
        }

        $blogTag->update($data);
        return $blogTag;
    }

    public function delete($id)
    {
        $blogTag = $this->find($id);

        if ($blogTag->blogs()->count() > 0) {
            throw new \Exception('Cannot delete tag that is being used by blogs.');
        }

        return $blogTag->delete();
    }

    public function getStats()
    {
        return [
            'total'   => BlogTag::count(),
            'active'  => BlogTag::where('is_active', true)->count(),
            'inactive' => BlogTag::where('is_active', false)->count(),
        ];
    }

    public function getActiveTags()
    {
        return BlogTag::active()->orderBy('name')->get(['id', 'name', 'color']);
    }
}
