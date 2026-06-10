<?php

namespace App\Http\Repositories\Admin;

use App\Models\Blog;
use Illuminate\Support\Str;

class BlogRepository
{
    public function getAll()
    {
        return Blog::with(['category', 'tags'])->latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = Blog::with(['category:id,name', 'tags:id,name,color'])
            ->select('id', 'blog_category_id', 'title', 'slug', 'excerpt', 'status', 'thumbnail', 'created_at', 'updated_at');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhereHas('category', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('blog_category_id')) {
            $query->where('blog_category_id', $request->blog_category_id);
        }

        // Sorting
        $sortBy = $request->get('sortBy', 'created_at');
        $sortOrder = $request->get('sortOrder', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('perPage', 10);
        $page = $request->get('page', 1);

        $blogs = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform data
        $transformedData = $blogs->map(function ($blog) {
            return [
                'id' => $blog->id,
                'blog_category_id' => $blog->blog_category_id,
                'title' => $blog->title,
                'slug' => $blog->slug,
                'excerpt' => $blog->excerpt,
                'status' => $blog->status,
                'thumbnail' => $blog->thumbnail,
                'created_at' => $blog->created_at,
                'updated_at' => $blog->updated_at,
                'category' => $blog->category,
                'tags' => $blog->tags,
                'category_name' => $blog->category?->name,
                'tags_list' => $blog->tags->pluck('name')->toArray(),
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'total' => $blogs->total(),
            'per_page' => $blogs->perPage(),
            'current_page' => $blogs->currentPage(),
            'last_page' => $blogs->lastPage(),
        ]);
    }

    public function find($id)
    {
        return Blog::findOrFail($id);
    }

    public function store(array $data, $thumbnailFile = null, $socialImageFile = null)
    {
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['title']);
        }

        if (empty($data['status'])) {
            $data['status'] = 'draft';
        }

        if ($thumbnailFile) {
            $data['thumbnail'] = $this->moveUploadedFile($thumbnailFile, 'blogs', $data['slug']);
        }

        if ($socialImageFile) {
            $data['social_image'] = $this->moveUploadedFile($socialImageFile, 'blogs/social', $data['slug']);
        }

        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        $blog = Blog::create($data);

        if (! empty($tags)) {
            $blog->tags()->attach($tags);
        }

        return $blog;
    }

    public function update($id, array $data, $thumbnailFile = null, $socialImageFile = null)
    {
        $blog = $this->find($id);

        if ($data['title'] !== $blog->title && empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['title'], $blog->id);
        }

        $slug = $data['slug'] ?? $blog->slug;

        if ($thumbnailFile) {
            if ($blog->thumbnail) {
                $this->deleteUploadedFile($blog->thumbnail);
            }
            $data['thumbnail'] = $this->moveUploadedFile($thumbnailFile, 'blogs', $slug);
        } else {
            unset($data['thumbnail']);
        }

        if ($socialImageFile) {
            if ($blog->social_image) {
                $this->deleteUploadedFile($blog->social_image);
            }
            $data['social_image'] = $this->moveUploadedFile($socialImageFile, 'blogs/social', $slug);
        } else {
            unset($data['social_image']);
        }

        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        $blog->update($data);
        $blog->tags()->sync($tags);

        return $blog;
    }

    public function delete($id)
    {
        $blog = $this->find($id);

        if ($blog->thumbnail) {
            $this->deleteUploadedFile($blog->thumbnail);
        }
        if ($blog->social_image) {
            $this->deleteUploadedFile($blog->social_image);
        }

        return $blog->delete();
    }

    public function getStats()
    {
        return [
            'total' => Blog::count(),
            'published' => Blog::where('status', 'published')->count(),
            'draft' => Blog::where('status', 'draft')->count(),
            'with_category' => Blog::whereNotNull('blog_category_id')->count(),
        ];
    }

    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        while (
            Blog::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Move uploaded file to public/storage/{folder}/{slug}.{ext}
     * Returns relative path e.g. "blogs/my-blog-post.jpg"
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
