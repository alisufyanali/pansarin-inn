<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;

class BlogApiController extends Controller
{
    // GET /api/blogs
    public function index(Request $request)
    {
        $query = Blog::with(['category:id,name,slug', 'tags:id,name,color'])
            ->where('status', 'published');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('blog_category_id', $request->category_id);
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('slug', $request->tag));
        }

        $blogs = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data'    => $blogs->map(fn ($b) => $this->formatBlog($b)),
            'meta'    => [
                'total'        => $blogs->total(),
                'per_page'     => $blogs->perPage(),
                'current_page' => $blogs->currentPage(),
                'last_page'    => $blogs->lastPage(),
            ],
        ]);
    }

    // GET /api/blogs/{slug}
    public function show(string $slug)
    {
        $blog = Blog::with(['category:id,name,slug', 'tags:id,name,color'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $this->formatBlog($blog, detailed: true),
        ]);
    }

    // ── Format Helper ─────────────────────────────────────────────
    private function formatBlog(Blog $b, bool $detailed = false): array
    {
        $base = [
            'id'         => $b->id,
            'title'      => $b->title,
            'slug'       => $b->slug,
            'excerpt'    => $b->excerpt,
            'thumbnail'  => $b->thumbnail ? asset('storage/' . $b->thumbnail) : null,
            'category'   => $b->category ? ['id' => $b->category->id, 'name' => $b->category->name, 'slug' => $b->category->slug] : null,
            'tags'       => $b->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color]),
            'created_at' => $b->created_at,
        ];

        if ($detailed) {
            $base['content']    = $b->content;
            $base['meta_title'] = $b->meta_title ?? $b->title;
            $base['meta_desc']  = $b->meta_description ?? $b->excerpt;
        }

        return $base;
    }
}
