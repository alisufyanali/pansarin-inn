<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class BlogCategoryController extends Controller
{
    public function __construct()
{
    $this->middleware('permission:create.blog-categories')->only(['create', 'store']);
    $this->middleware('permission:edit.blog-categories')->only(['edit', 'update']);
    $this->middleware('permission:delete.blog-categories')->only(['destroy']);
}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $stats = [
            'total' => BlogCategory::count(),
            'with_parent' => BlogCategory::whereNotNull('parent_id')->count(),
            'root_categories' => BlogCategory::whereNull('parent_id')->count(),
        ];

        return Inertia::render('Admin/BlogCategories/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }

    /**
     * Get DataTable data - API endpoint for DataTableWrapper
     */
    public function getData(Request $request)
    {
        $query = BlogCategory::with('parent')->latest();
        
        // Search handling
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('meta_title', 'like', "%{$search}%")
                      ->orWhereHas('parent', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            }
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('slug', 'like', "%{$search}%")
                          ->orWhere('meta_title', 'like', "%{$search}%")
                          ->orWhereHas('parent', function($q) use ($search) {
                              $q->where('name', 'like', "%{$search}%");
                          });
                    });
                }
            }
        }
        
        // Additional filters
        if ($request->has('parent_id') && $request->parent_id !== '') {
            if ($request->parent_id === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        return DataTables::of($query)
            ->addColumn('parent_name', function($category) {
                return $category->parent ? $category->parent->name : null;
            })
            ->make(true);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parents = BlogCategory::whereNull('parent_id')->get(['id', 'name']);
        
        return Inertia::render('Admin/BlogCategories/Create', [
            'parents' => $parents
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blog_categories',
                'parent_id' => 'nullable|exists:blog_categories,id',
                'meta_title' => 'nullable|string|max:60',
                'meta_description' => 'nullable|string|max:160',
                'meta_keywords' => 'nullable|string',
                'schema_markup' => 'nullable|string',
                'social_image' => 'nullable|image|max:2048',
                'social_description' => 'nullable|string|max:300',
            ]);

            // Auto-generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = str()->slug($validated['name']);
            }

            // Handle social image upload
            if ($request->hasFile('social_image')) {
                $validated['social_image'] = $request->file('social_image')->store('blog-categories', 'public');
            }

            BlogCategory::create($validated);

            return to_route('blogcategories.index')->with('success', 'Blog category successfully created!');
        } catch (\Exception $e) {
            \Log::error('Blog category creation error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create blog category.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(BlogCategory $blogcategory)
    {
        return Inertia::render('Admin/BlogCategories/Show', [
            'blogCategory' => $blogcategory->load('parent')
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BlogCategory $blogcategory)
    {
        $parents = BlogCategory::whereNull('parent_id')
            ->where('id', '!=', $blogcategory->id)
            ->get(['id', 'name']);

        return Inertia::render('Admin/BlogCategories/Edit', [
            'blogCategory' => $blogcategory,
            'parents' => $parents
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BlogCategory $blogcategory)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blog_categories,slug,' . $blogcategory->id,
                'parent_id' => 'nullable|exists:blog_categories,id',
                'meta_title' => 'nullable|string|max:60',
                'meta_description' => 'nullable|string|max:160',
                'meta_keywords' => 'nullable|string',
                'schema_markup' => 'nullable|string',
                'social_image' => 'nullable|image|max:2048',
                'social_description' => 'nullable|string|max:300',
            ]);

            // Update slug if name changed
            if ($validated['name'] !== $blogcategory->name && empty($validated['slug'])) {
                $validated['slug'] = str()->slug($validated['name']);
            }

            // Handle social image upload
            if ($request->hasFile('social_image')) {
                $validated['social_image'] = $request->file('social_image')->store('blog-categories', 'public');
            }

            $blogcategory->update($validated);

            return to_route('blogcategories.index')->with('success', 'Blog category successfully updated!');
        } catch (\Exception $e) {
            \Log::error('Blog category update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update blog category.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BlogCategory $blogcategory)
    {
        try {
            // Check if category has children
            if ($blogcategory->children()->count() > 0) {
                return back()->with('error', 'Cannot delete category with sub-categories. Please delete or reassign sub-categories first.');
            }

            $blogcategory->delete();
            
            return to_route('blogcategories.index')->with('success', 'Blog category successfully deleted!');
        } catch (\Exception $e) {
            \Log::error('Blog category deletion error: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete blog category.');
        }
    }
}