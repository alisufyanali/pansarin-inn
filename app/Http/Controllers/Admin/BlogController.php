<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:create.blogs')->only(['create', 'store']);
        $this->middleware('permission:edit.blogs')->only(['edit', 'update']);
        $this->middleware('permission:delete.blogs')->only(['destroy']);
        $this->middleware('permission:view.blogs')->only(['index', 'getData', 'show']);
    }

    public function index(Request $request)
    {
        $stats = [
            'total' => Blog::count(),
            'published' => Blog::where('status', 'published')->count(),
            'draft' => Blog::where('status', 'draft')->count(),
            'with_category' => Blog::whereNotNull('blog_category_id')->count(),
        ];

        return Inertia::render('Admin/Blogs/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        try {
            // Base query
            $query = Blog::query()
                ->with(['category:id,name', 'tags:id,name,color'])
                ->select('id', 'blog_category_id', 'title', 'slug', 'excerpt', 'status', 'thumbnail', 'created_at', 'updated_at');
            
            // Search
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhereHas('category', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
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
            $transformedData = $blogs->map(function($blog) {
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

        } catch (\Exception $e) {
            \Log::error('Blogs getData error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to load data',
                'message' => $e->getMessage(),
                'data' => [],
                'total' => 0,
            ], 500);
        }
    }

    public function create()
    {
        $categories = BlogCategory::orderBy('name')->get(['id', 'name']);
        
        $tags = BlogTag::where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug', 'color']);
        
        return Inertia::render('Admin/Blogs/Create', [
            'categories' => $categories,
            'tags' => $tags
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'blog_category_id' => 'nullable|exists:blog_categories,id',
                'title' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blogs',
                'content' => 'nullable|string',
                'excerpt' => 'nullable|string|max:500',
                'status' => 'nullable|in:draft,published',
                'thumbnail' => 'nullable|image|max:2048',
                'meta_title' => 'nullable|string|max:60',
                'meta_description' => 'nullable|string|max:160',
                'meta_keywords' => 'nullable|string',
                'schema_markup' => 'nullable|string',
                'social_image' => 'nullable|image|max:2048',
                'social_description' => 'nullable|string|max:300',
                'tags' => 'nullable|array',
                'tags.*' => 'exists:blog_tags,id',
            ]);

            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['title']);
            }

            if (empty($validated['status'])) {
                $validated['status'] = 'draft';
            }

            if ($request->hasFile('thumbnail')) {
                $validated['thumbnail'] = $request->file('thumbnail')->store('blogs', 'public');
            }

            if ($request->hasFile('social_image')) {
                $validated['social_image'] = $request->file('social_image')->store('blogs', 'public');
            }

            // Extract tags before creating blog
            $tags = $validated['tags'] ?? [];
            unset($validated['tags']);

            $blog = Blog::create($validated);

            // Attach tags to blog
            if (!empty($tags)) {
                $blog->tags()->attach($tags);
            }

            return to_route('blogs.index')->with('success', 'Blog post successfully created!');
        } catch (\Exception $e) {
            \Log::error('Blog creation error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create blog post.']);
        }
    }

    public function show(Blog $blog)
    {
        return Inertia::render('Admin/Blogs/Show', [
            'blog' => $blog->load(['category', 'tags'])
        ]);
    }

public function edit(Blog $blog)
{
    $blog->load('tags:id,name,slug,color', 'category:id,name');
    
    return Inertia::render('Admin/Blogs/Edit', [
        'blog' => $blog,
        'categories' => BlogCategory::orderBy('name')->get(['id', 'name']),
        'tags' => BlogTag::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'color'])
    ]);
}

    public function update(Request $request, Blog $blog)
    {
        try {
            $validated = $request->validate([
                'blog_category_id' => 'nullable|exists:blog_categories,id',
                'title' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blogs,slug,' . $blog->id,
                'content' => 'nullable|string',
                'excerpt' => 'nullable|string|max:500',
                'status' => 'nullable|in:draft,published',
                'thumbnail' => 'nullable|image|max:2048',
                'meta_title' => 'nullable|string|max:60',
                'meta_description' => 'nullable|string|max:160',
                'meta_keywords' => 'nullable|string',
                'schema_markup' => 'nullable|string',
                'social_image' => 'nullable|image|max:2048',
                'social_description' => 'nullable|string|max:300',
                'tags' => 'nullable|array',
                'tags.*' => 'exists:blog_tags,id',
            ]);

            if ($validated['title'] !== $blog->title && empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['title']);
            }

            if ($request->hasFile('thumbnail')) {
                if ($blog->thumbnail) {
                    \Storage::disk('public')->delete($blog->thumbnail);
                }
                $validated['thumbnail'] = $request->file('thumbnail')->store('blogs', 'public');
            }

            if ($request->hasFile('social_image')) {
                if ($blog->social_image) {
                    \Storage::disk('public')->delete($blog->social_image);
                }
                $validated['social_image'] = $request->file('social_image')->store('blogs', 'public');
            }

            // Extract tags before updating blog
            $tags = $validated['tags'] ?? [];
            unset($validated['tags']);

            $blog->update($validated);

            // Sync tags
            $blog->tags()->sync($tags);

            return to_route('blogs.index')->with('success', 'Blog post successfully updated!');
        } catch (\Exception $e) {
            \Log::error('Blog update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update blog post.']);
        }
    }

    public function destroy(Blog $blog)
    {
        try {
            if ($blog->thumbnail) {
                \Storage::disk('public')->delete($blog->thumbnail);
            }
            if ($blog->social_image) {
                \Storage::disk('public')->delete($blog->social_image);
            }

            // Tags will be automatically detached due to cascade
            $blog->delete();
            
            return to_route('blogs.index')->with('success', 'Blog post successfully deleted!');
        } catch (\Exception $e) {
            \Log::error('Blog deletion error: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete blog post.');
        }
    }
}