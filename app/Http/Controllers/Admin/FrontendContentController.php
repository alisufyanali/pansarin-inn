<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FrontendContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

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
        $stats = [
            'total'    => FrontendContent::count(),
            'carousel' => FrontendContent::where('type', 'carousel')->count(),
            'banner'   => FrontendContent::where('type', 'banner')->count(),
            'active'   => FrontendContent::where('is_active', true)->count(),
        ];

        return Inertia::render('Admin/Frontend/Index', [
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        $query = FrontendContent::query()->orderBy('order', 'asc');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === '1');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sort_by') && $request->filled('sort_order')) {
            $query->orderBy($request->sort_by, $request->sort_order);
        }

        $perPage = $request->input('perPage', $request->input('per_page', 10));
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
                'type'        => 'required|in:carousel,banner',
                'image'       => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'title'       => 'nullable|string|max:255',
                'order'       => 'nullable|integer|min:0',
                'is_active'   => 'nullable|boolean',
                'link'        => 'nullable|url|max:255',
                'description' => 'nullable|string|max:1000',
            ]);

            if ($request->hasFile('image')) {
                $data['image'] = $this->moveUploadedFile($request->file('image'), 'frontend');
            }

            $data['is_active'] = $data['is_active'] ?? true;
            $data['order']     = $data['order'] ?? 0;

            FrontendContent::create($data);

            return redirect()
                ->route('frontend.index')
                ->with('success', 'Content created successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('FrontendContent creation error: ' . $e->getMessage());
            return back()->with('error', 'Failed to create content: ' . $e->getMessage())->withInput();
        }
    }

    public function show(FrontendContent $frontend)
    {
        return Inertia::render('Admin/Frontend/Show', [
            'frontendContent' => $frontend,
        ]);
    }

    public function edit(FrontendContent $frontend)
    {
        return Inertia::render('Admin/Frontend/Edit', [
            'frontendContent' => $frontend,
        ]);
    }

    public function update(Request $request, FrontendContent $frontend)
    {
        try {
            $data = $request->validate([
                'type'        => 'required|in:carousel,banner',
                'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'title'       => 'nullable|string|max:255',
                'order'       => 'nullable|integer|min:0',
                'is_active'   => 'nullable|boolean',
                'link'        => 'nullable|url|max:255',
                'description' => 'nullable|string|max:1000',
            ]);

            if ($request->hasFile('image')) {
                // Upload new file first — only delete old after success
                $newPath = $this->moveUploadedFile($request->file('image'), 'frontend');
                if ($frontend->image) {
                    $this->deleteUploadedFile($frontend->image);
                }
                $data['image'] = $newPath;
            }

            $frontend->update($data);

            return redirect()
                ->route('frontend.index')
                ->with('success', 'Content updated successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('FrontendContent update error: ' . $e->getMessage());
            return back()->with('error', 'Failed to update content: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(FrontendContent $frontend)
    {
        try {
            if ($frontend->image) {
                $this->deleteUploadedFile($frontend->image);
            }

            $frontend->delete();

            return redirect()
                ->route('frontend.index')
                ->with('success', 'Content deleted successfully.');

        } catch (\Exception $e) {
            Log::error('FrontendContent deletion error: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete content: ' . $e->getMessage());
        }
    }

    // ── Native-PHP file helpers (bypasses Flysystem / finfo) ──────

    /**
     * Move an UploadedFile to public/storage/{folder} using native PHP.
     * Returns the relative path stored in the database, e.g. "frontend/abc123.jpg".
     */
    private function moveUploadedFile($file, string $folder): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename  = Str::uuid() . '.' . $extension;
        $directory = public_path('storage/' . $folder);

        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $file->move($directory, $filename);

        return $folder . '/' . $filename;
    }

    /**
     * Delete a file stored via moveUploadedFile().
     */
    private function deleteUploadedFile(string $relativePath): void
    {
        $fullPath = public_path('storage/' . $relativePath);

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }
}
