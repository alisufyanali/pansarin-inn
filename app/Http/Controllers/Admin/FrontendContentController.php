<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FrontendContent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class FrontendContentController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view.frontend')->only(['index', 'show']);
        $this->middleware('permission:create.frontend')->only(['create', 'store']);
        $this->middleware('permission:edit.frontend')->only(['edit', 'update']);
        $this->middleware('permission:delete.frontend')->only(['destroy']);
    }

    public function index(Request $request)
    {
        // Calculate stats
        $stats = [
            'total' => FrontendContent::count(),
            'carousel' => FrontendContent::where('type', 'carousel')->count(),
            'banner' => FrontendContent::where('type', 'banner')->count(),
            'active' => FrontendContent::where('is_active', true)->count(),
        ];
        
        return Inertia::render('Admin/Frontend/Index', [
            'stats' => $stats,
        ]);
    }

    // New method for DataTable API
    public function getData(Request $request)
    {
        $query = FrontendContent::query()->orderBy('order', 'asc');
        
        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === '1');
        }
        
        // Apply search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }
        
        // Apply sorting
        if ($request->filled('sort_by') && $request->filled('sort_order')) {
            $query->orderBy($request->sort_by, $request->sort_order);
        }
        
        // Pagination
        $perPage = $request->input('per_page', 10);
        $contents = $query->paginate($perPage);
        
        return response()->json($contents);
    }

    public function create()
    {
        return Inertia::render('Admin/Frontend/Create');
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'type' => 'required|in:carousel,banner',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'title' => 'nullable|string|max:255',
                'order' => 'nullable|integer|min:0',
                'is_active' => 'nullable|boolean',
                'link' => 'nullable|url|max:255',
                'description' => 'nullable|string|max:1000',
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('frontend', 'public');
            }

            // Set defaults
            $data['is_active'] = $data['is_active'] ?? true;
            $data['order'] = $data['order'] ?? 0;

            FrontendContent::create($data);

            return redirect()
                ->route('frontend.index')
                ->with('success', 'Content created successfully.');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('FrontendContent creation error: ' . $e->getMessage());
            return back()
                ->with('error', 'Failed to create content: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(FrontendContent $frontend)
    {
        return Inertia::render('Admin/Frontend/Show', [
            'frontendContent' => $frontend
        ]);
    }

    public function edit(FrontendContent $frontend)
    {
        return Inertia::render('Admin/Frontend/Edit', [
            'frontendContent' => $frontend
        ]);
    }

    public function update(Request $request, FrontendContent $frontend)
    {
        try {
            $data = $request->validate([
                'type' => 'required|in:carousel,banner',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'title' => 'nullable|string|max:255',
                'order' => 'nullable|integer|min:0',
                'is_active' => 'nullable|boolean',
                'link' => 'nullable|url|max:255',
                'description' => 'nullable|string|max:1000',
            ]);

            // Handle new image upload
            if ($request->hasFile('image')) {
                // Delete old image
                if ($frontend->image) {
                    Storage::disk('public')->delete($frontend->image);
                }
                $data['image'] = $request->file('image')->store('frontend', 'public');
            }

            $frontend->update($data);

            return redirect()
                ->route('frontend.index')
                ->with('success', 'Content updated successfully.');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('FrontendContent update error: ' . $e->getMessage());
            return back()
                ->with('error', 'Failed to update content: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(FrontendContent $frontend)
    {
        try {
            // Delete image file
            if ($frontend->image) {
                Storage::disk('public')->delete($frontend->image);
            }

            $frontend->delete();

            return redirect()
                ->route('frontend.index')
                ->with('success', 'Content deleted successfully.');
                
        } catch (\Exception $e) {
            Log::error('FrontendContent deletion error: ' . $e->getMessage());
            return back()
                ->with('error', 'Failed to delete content: ' . $e->getMessage());
        }
    }
}