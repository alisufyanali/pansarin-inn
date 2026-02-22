<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\BlogRepository;
use App\Http\Requests\Admin\BlogRequest;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    protected $blogRepo;

    public function __construct(BlogRepository $blogRepo)
    {
        $this->blogRepo = $blogRepo;

        $this->middleware('permission:create.blogs')->only(['create', 'store']);
        $this->middleware('permission:edit.blogs')->only(['edit', 'update']);
        $this->middleware('permission:delete.blogs')->only(['destroy']);
        $this->middleware('permission:view.blogs')->only(['index', 'getData', 'show']);
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/Blogs/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $this->blogRepo->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        return $this->blogRepo->getAllForDataTable($request);
    }

    public function create()
    {
        $categories = BlogCategory::orderBy('name')->get(['id', 'name']);
        $tags = BlogTag::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'color']);

        return Inertia::render('Admin/Blogs/Create', [
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    public function store(BlogRequest $request)
    {
        try {
            $this->blogRepo->store(
                $request->validated(),
                $request->file('thumbnail'),
                $request->file('social_image')
            );

            return to_route('admin.blogs.index')
                ->with('success', 'Blog post successfully created!');

        } catch (\Exception $e) {
            \Log::error('Blog creation error: '.$e->getMessage());

            return back()->withErrors(['error' => 'Failed to create blog post.']);
        }
    }

    public function show(Blog $blog)
    {
        return Inertia::render('Admin/Blogs/Show', [
            'blog' => $blog->load(['category', 'tags']),
        ]);
    }

    public function edit(Blog $blog)
    {
        $blog->load('tags:id,name,slug,color', 'category:id,name');

        return Inertia::render('Admin/Blogs/Edit', [
            'blog' => $blog,
            'categories' => BlogCategory::orderBy('name')->get(['id', 'name']),
            'tags' => BlogTag::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'color']),
        ]);
    }

    public function update(BlogRequest $request, Blog $blog)
    {
        try {
            $this->blogRepo->update(
                $blog->id,
                $request->validated(),
                $request->file('thumbnail'),
                $request->file('social_image')
            );

            return to_route('admin.blogs.index')
                ->with('success', 'Blog post successfully updated!');

        } catch (\Exception $e) {
            \Log::error('Blog update error: '.$e->getMessage());

            return back()->withErrors(['error' => 'Failed to update blog post.']);
        }
    }

    public function destroy(Blog $blog)
    {
        try {
            $this->blogRepo->delete($blog->id);

            return to_route('admin.blogs.index')
                ->with('success', 'Blog post successfully deleted!');

        } catch (\Exception $e) {
            \Log::error('Blog deletion error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete blog post.');
        }
    }
}
