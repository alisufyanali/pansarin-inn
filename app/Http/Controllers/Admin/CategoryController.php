<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\CategoryRepository;
use App\Http\Requests\Admin\CategoryRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    protected $categoryRepo;

    public function __construct(CategoryRepository $categoryRepo)
    {
        $this->categoryRepo = $categoryRepo;

        $this->middleware('permission:view.categories')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.categories')->only(['create', 'store']);
        $this->middleware('permission:edit.categories')->only(['edit', 'update']);
        $this->middleware('permission:delete.categories')->only(['destroy']);
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/Categories/Index', [
            'stats' => $this->categoryRepo->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        return $this->categoryRepo->getAllForDataTable($request);
    }

    public function create()
    {
        return Inertia::render('Admin/Categories/Create', [
            'categories' => $this->categoryRepo->getParents(),
        ]);
    }

    public function store(CategoryRequest $request)
    {
        try {
            $this->categoryRepo->store(
                $request->validated(),
                $request->file('image'),
                $request->file('social_image')
            );

            \Illuminate\Support\Facades\Cache::forget('homepage_data');

            return to_route('admin.categories.index')
                ->with('success', 'Category successfully created!');

        } catch (\Exception $e) {
            \Log::error('Category creation error: '.$e->getMessage());

            return back()->withInput()->with('error', 'Failed to create category.');
        }
    }

    public function show(string $id)
    {
        $category = $this->categoryRepo->find($id);

        return Inertia::render('Admin/Categories/Show', [
            'category' => $category->load(['parent', 'children']),
        ]);
    }

    public function edit(string $id)
    {
        $category = $this->categoryRepo->find($id);

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'categories' => $this->categoryRepo->getParents($id),
        ]);
    }

    public function update(CategoryRequest $request, string $id)
    {
        try {
            $this->categoryRepo->update(
                $id,
                $request->validated(),
                $request->file('image'),
                $request->file('social_image')
            );

            \Illuminate\Support\Facades\Cache::forget('homepage_data');

            return to_route('admin.categories.index')
                ->with('success', 'Category successfully updated!');

        } catch (\Exception $e) {
            \Log::error('Category update error: '.$e->getMessage());

            return back()->withInput()->with('error', 'Failed to update category.');
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->categoryRepo->delete($id);

            \Illuminate\Support\Facades\Cache::forget('homepage_data');

            return redirect()->route('admin.categories.index')
                ->with('success', 'Category successfully deleted!');

        } catch (\Exception $e) {
            \Log::error('Category deletion error: '.$e->getMessage());

            return redirect()->route('admin.categories.index')
                ->with('error', 'Failed to delete category.');
        }
    }
}
