<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BlogCategoryRequest;
use App\Http\Repositories\Admin\BlogCategoryRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogCategoryController extends Controller
{
    protected $blogCategoryRepo;

    public function __construct(BlogCategoryRepository $blogCategoryRepo)
    {
        $this->blogCategoryRepo = $blogCategoryRepo;

        $this->middleware('permission:create.blog-categories')->only(['create', 'store']);
        $this->middleware('permission:edit.blog-categories')->only(['edit', 'update']);
        $this->middleware('permission:delete.blog-categories')->only(['destroy']);
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/BlogCategories/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats'    => $this->blogCategoryRepo->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        return $this->blogCategoryRepo->getAllForDataTable($request);
    }

    public function create()
    {
        return Inertia::render('Admin/BlogCategories/Create', [
            'parents' => $this->blogCategoryRepo->getParents(),
        ]);
    }

    public function store(BlogCategoryRequest $request)
    {
        try {
            $this->blogCategoryRepo->store(
                $request->validated(),
                $request->file('social_image')
            );

            return to_route('admin.blogcategories.index')
                ->with('success', 'Blog category successfully created!');

        } catch (\Exception $e) {
            \Log::error('Blog category creation error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create blog category.']);
        }
    }

    public function show($id)
    {
        $blogCategory = $this->blogCategoryRepo->find($id);

        return Inertia::render('Admin/BlogCategories/Show', [
            'blogCategory' => $blogCategory->load('parent'),
        ]);
    }

    public function edit($id)
    {
        $blogCategory = $this->blogCategoryRepo->find($id);

        return Inertia::render('Admin/BlogCategories/Edit', [
            'blogCategory' => $blogCategory,
            'parents'      => $this->blogCategoryRepo->getParents($id),
        ]);
    }

    public function update(BlogCategoryRequest $request, $id)
    {
        try {
            $this->blogCategoryRepo->update(
                $id,
                $request->validated(),
                $request->file('social_image')
            );

            return to_route('admin.blogcategories.index')
                ->with('success', 'Blog category successfully updated!');

        } catch (\Exception $e) {
            \Log::error('Blog category update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update blog category.']);
        }
    }

    public function destroy($id)
    {
        try {
            $this->blogCategoryRepo->delete($id);

            return to_route('admin.blogcategories.index')
                ->with('success', 'Blog category successfully deleted!');

        } catch (\Exception $e) {
            \Log::error('Blog category deletion error: ' . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }
}