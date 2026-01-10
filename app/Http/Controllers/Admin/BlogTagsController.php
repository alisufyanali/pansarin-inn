<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Str;

class BlogTagsController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:create.blogtags')->only(['create', 'store']);
        $this->middleware('permission:edit.blogtags')->only(['edit', 'update']);
        $this->middleware('permission:delete.blogtags')->only(['destroy']);
    }

    public function index(Request $request)
{
    $stats = [
        'total' => BlogTag::count(),
        'active' => BlogTag::where('is_active', true)->count(),
        'inactive' => BlogTag::where('is_active', false)->count(),
    ];

    return Inertia::render('Admin/BlogsTags/Index', [  // Path same rahega
        'userRole' => $request->user()->role ?? 'admin',
        'stats' => $stats,
    ]);
}

    public function getData(Request $request)
    {
        $query = BlogTag::withCount('blogs')->latest();
        
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('slug', 'like', "%{$search}%")
                          ->orWhere('description', 'like', "%{$search}%");
                    });
                }
            }
        }
        
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active === 'true' || $request->is_active === '1');
        }

        return DataTables::of($query)
            ->addColumn('status_text', function($tag) {
                return $tag->is_active ? 'Active' : 'Inactive';
            })
            ->make(true);
    }

    public function create()
    {
        return Inertia::render('Admin/BlogsTags/Create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blog_tags',
                'description' => 'nullable|string|max:500',
                'color' => 'nullable|string|max:7',
                'is_active' => 'nullable|boolean',
            ]);

            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            if (empty($validated['color'])) {
                $validated['color'] = '#3B82F6';
            }

            if (!isset($validated['is_active'])) {
                $validated['is_active'] = true;
            }

            BlogTag::create($validated);

            return to_route('blogstags.index')->with('success', 'Tag successfully created!'); // CHANGED
        } catch (\Exception $e) {
            \Log::error('Blog tag creation error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create tag: ' . $e->getMessage()]);
        }
    }

    public function show(BlogTag $blogsTag)
{
    // Load relationships
    $blogsTag->load(['blogs' => function($query) {
        $query->select('blogs.id', 'blogs.title', 'blogs.slug', 'blogs.status', 'blogs.created_at')
              ->orderBy('created_at', 'desc');
    }]);

    return Inertia::render('Admin/BlogsTags/Show', [
        'tag' => $blogsTag
    ]);
}

    public function edit(BlogTag $blogTag)
    {
        return Inertia::render('Admin/BlogsTags/Edit', [
            'tag' => $blogTag
        ]);
    }

    public function update(Request $request, BlogTag $blogTag)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blog_tags,slug,' . $blogTag->id,
                'description' => 'nullable|string|max:500',
                'color' => 'nullable|string|max:7',
                'is_active' => 'nullable|boolean',
            ]);

            if ($validated['name'] !== $blogTag->name && empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            $blogTag->update($validated);

            return to_route('blogstags.index')->with('success', 'Tag successfully updated!'); // CHANGED

        } catch (\Exception $e) {
            \Log::error('Blog tag update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update tag: ' . $e->getMessage()]);
        }
    }

    public function destroy(BlogTag $blogTag)
{
    try {
        $blogTag->delete();

        return to_route('blogstags.index')->with('success', 'Tag successfully deleted!'); // CHANGED
    } catch (\Exception $e) {
        \Log::error('Blog tag deletion error: ' . $e->getMessage());
        return back()->with('error', 'Failed to delete tag.');
    }
}

    /**
     * Get all active tags for selection
     */
    public function getActiveTags()
    {
        return response()->json([
            'tags' => BlogTag::active()->select('id', 'name', 'slug', 'color')->get()
        ]);
    }
}