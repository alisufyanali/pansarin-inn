<?php

namespace App\Http\Repositories\Admin;

use App\Models\BlogCategory;
use Illuminate\Support\Str;

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
        if ($request->has('search') && ! empty($request->search)) {
            $search = is_array($request->search) ? ($request->search['value'] ?? '') : $request->search;
            if (! empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('meta_title', 'like', "%{$search}%")
                        ->orWhereHas('parent', fn ($q) => $q->where('name', 'like', "%{$search}%"));
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

        $perPage   = (int) $request->get('perPage', $request->get('per_page', 10));
        $page      = (int) $request->get('page', 1);
        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data'         => $paginated->map(function ($row) {
                $arr = $row->toArray();
                $arr['parent_name'] = $row->parent?->name ?? 'N/A';
                return $arr;
            })->values(),
            'total'        => $paginated->total(),
            'per_page'     => $paginated->perPage(),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
        ]);
    }

    public function find($id)
    {
        return BlogCategory::findOrFail($id);
    }

    public function getParents($excludeId = null)
    {
        return BlogCategory::whereNull('parent_id')
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->get(['id', 'name']);
    }

    public function store(array $data, $socialImageFile = null)
    {
        if (empty($data['slug'])) {
            $data['slug'] = str()->slug($data['name']);
        }

        if ($socialImageFile) {
            $slug = $data['slug'] ?: str()->slug($data['name']);
            $data['social_image'] = $this->moveUploadedFile($socialImageFile, 'blog-categories', $slug);
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
            if ($blogCategory->social_image) {
                $this->deleteUploadedFile($blogCategory->social_image);
            }
            $slug = $data['slug'] ?? $blogCategory->slug;
            $data['social_image'] = $this->moveUploadedFile($socialImageFile, 'blog-categories', $slug);
        } else {
            unset($data['social_image']);
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
            $this->deleteUploadedFile($blogCategory->social_image);
        }

        return $blogCategory->delete();
    }

    public function getStats()
    {
        return [
            'total' => BlogCategory::count(),
            'with_parent' => BlogCategory::whereNotNull('parent_id')->count(),
            'root_categories' => BlogCategory::whereNull('parent_id')->count(),
        ];
    }

    /**
     * Move uploaded file to public/storage/{folder}/{slug}.{ext}
     * Returns relative path e.g. "blog-categories/health-wellness.jpg"
     */
    private function moveUploadedFile($file, string $folder, string $slug): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename  = Str::slug($slug) . '.' . $extension;
        $directory = public_path('storage/' . $folder);

        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $file->move($directory, $filename);

        return $folder . '/' . $filename;
    }

    /**
     * Delete a file stored via moveUploadedFile()
     */
    private function deleteUploadedFile(string $relativePath): void
    {
        $fullPath = public_path('storage/' . $relativePath);

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }
}
