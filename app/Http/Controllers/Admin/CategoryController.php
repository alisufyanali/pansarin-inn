<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use Yajra\DataTables\Facades\DataTables;

class CategoryController extends Controller
{
    public function __construct()
    {
        // $this->middleware('permission:create.categories')->only(['create', 'store']);
        // $this->middleware('permission:edit.categories')->only(['edit', 'update']);
        // $this->middleware('permission:delete.categories')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Inertia::render('Admin/Categories/Index', [
            'userRole' => $request->user()->role ?? 'admin',
        ]);
    }

    /**
     * Get DataTable data - API endpoint for DataTableWrapper
     */
  
    public function getData(Request $request)
    {
        $query = Category::with('parent')->latest();
        
        // ✅ DataTables format mein search handle karo
        if ($request->has('search') && $request->search !== '') {
            // Agar 'search' string hai (tumhara format)
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('parent', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
                });
            }
            // Agar 'search' array hai (DataTables format)
            elseif (is_array($request->search) && isset($request->search['value'])) {
                $search = $request->search['value'];
                if (!empty($search)) {
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhereHas('parent', function($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                    });
                }
            }
        }
        
        // ✅ Additional filters
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status === 'active');
        }
        
        if ($request->has('parent_id') && $request->parent_id !== '') {
            $query->where('parent_id', $request->parent_id);
        }

        return DataTables::of($query)
            ->addColumn('parent_name', function($category) {
                return $category->parent ? $category->parent->name : null;
            })
            ->addColumn('status_text', function($category) {
                return $category->status ? 'Active' : 'Inactive';
            })
            ->make(true);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Categories/Create', [
            'categories' => Category::all(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string',
            'status' => 'boolean',
        ]);

        $validated['slug'] = str()->slug($validated['name']);

        Category::create($validated);

        return to_route('categories.index')->with('success', 'Category successfully created!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $category = Category::with(['parent', 'products', 'children'])->findOrFail($id);

        return Inertia::render('Admin/Categories/Show', [
            'category' => $category
        ]);
    }

    /**
     * Show the form for editing the existing resource.
     */
    public function edit(string $id)
    {
        $category = Category::findOrFail($id);

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'categories' => Category::where('id', '!=', $id)->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string',
            'status' => 'boolean',
        ]);

        if ($validated['name'] !== $category->name) {
            $validated['slug'] = str()->slug($validated['name']);
        }

        $category->update($validated);

        return to_route('categories.index')->with('success', 'Category successfully updated!');
    }

    /**
     * Remove the specified resource from storage.
     */
   public function destroy(string $id)
{
    try {
        $category = Category::findOrFail($id);
        
        // Option 1: Delete with children
        $category->delete(); // This should cascade if foreign key is set
        
        // Option 2: Or manually delete children first
        // $category->children()->delete();
        // $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Category successfully deleted!');
            
    } catch (\Exception $e) {
        return redirect()->route('categories.index')
            ->with('error', 'Failed to delete category: ' . $e->getMessage());
    }
}
}