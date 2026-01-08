<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view.categories')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.categories')->only(['create', 'store']);
        $this->middleware('permission:edit.categories')->only(['edit', 'update']);
        $this->middleware('permission:delete.categories')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $stats = [
            'total' => Category::count(),
            'active' => Category::where('status', true)->count(),
            'withParent' => Category::whereNotNull('parent_id')->count(),
            'topLevel' => Category::whereNull('parent_id')->count(),
        ];
        
        return Inertia::render('Admin/Categories/Index', [
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        try {
            $query = Category::query()
                ->with('parent:id,name')
                ->select('id', 'name', 'slug', 'image', 'status', 'parent_id', 'created_at', 'updated_at');
            
            // Search
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhereHas('parent', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
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
            $transformedData = $categories->map(function($category) {
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

        } catch (\Exception $e) {
            Log::error('Categories getData error: ' . $e->getMessage());
            
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
        return Inertia::render('Admin/Categories/Create', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'parent_id' => 'nullable|exists:categories,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'status' => 'boolean',
            ]);

            $validated['slug'] = str()->slug($validated['name']);

            // Handle image upload
            if ($request->hasFile('image')) {
                $validated['image'] = $request->file('image')->store('categories', 'public');
            }

            Category::create($validated);

            return to_route('categories.index')->with('success', 'Category successfully created!');
            
        } catch (\Exception $e) {
            Log::error('Category creation error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to create category.');
        }
    }

    public function show(string $id)
    {
        $category = Category::with(['parent', 'children'])->findOrFail($id);

        return Inertia::render('Admin/Categories/Show', [
            'category' => $category
        ]);
    }

    public function edit(string $id)
    {
        $category = Category::findOrFail($id);

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'categories' => Category::where('id', '!=', $id)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, string $id)
    {
        try {
            $category = Category::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'parent_id' => 'nullable|exists:categories,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'status' => 'boolean',
            ]);

            if ($validated['name'] !== $category->name) {
                $validated['slug'] = str()->slug($validated['name']);
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image
                if ($category->image) {
                    Storage::disk('public')->delete($category->image);
                }
                $validated['image'] = $request->file('image')->store('categories', 'public');
            }

            $category->update($validated);

            return to_route('categories.index')->with('success', 'Category successfully updated!');
            
        } catch (\Exception $e) {
            Log::error('Category update error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to update category.');
        }
    }

    public function destroy(string $id)
    {
        try {
            $category = Category::findOrFail($id);
            
            // Delete image
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            
            $category->delete();

            return redirect()->route('categories.index')
                ->with('success', 'Category successfully deleted!');
                
        } catch (\Exception $e) {
            Log::error('Category deletion error: ' . $e->getMessage());
            return redirect()->route('categories.index')
                ->with('error', 'Failed to delete category.');
        }
    }
}