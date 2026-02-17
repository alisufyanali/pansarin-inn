<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BlogCommentsRequest;
use App\Http\Repositories\Admin\BlogCommentsRepository;
use App\Models\BlogComments;
use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogsCommentsController extends Controller
{
    protected $blogCommentsRepo;

    public function __construct(BlogCommentsRepository $blogCommentsRepo)
    {
        $this->blogCommentsRepo = $blogCommentsRepo;

        $this->middleware('permission:view.blogcomments')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.blogcomments')->only(['create', 'store']);
        $this->middleware('permission:edit.blogcomments')->only(['edit', 'update']);
        $this->middleware('permission:delete.blogcomments')->only(['destroy']);
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/BlogsComments/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $this->blogCommentsRepo->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        return $this->blogCommentsRepo->getAllForDataTable($request);
    }

    public function create()
    {
        try {
            $blogs = Blog::where('status', 'published')
                        ->orderBy('title')
                        ->get(['id', 'title']);

            return Inertia::render('Admin/BlogsComments/Create', [
                'blogs' => $blogs
            ]);
        } catch (\Exception $e) {
            \Log::error('Blog comments create page error: ' . $e->getMessage());
            return back()->with('error', 'Failed to load create form.');
        }
    }

    public function store(BlogCommentsRequest $request)
    {
        try {
            $this->blogCommentsRepo->store($request->validated());

            return to_route('admin.blogscomments.index')
                ->with('success', 'Comment successfully created!');

        } catch (\Exception $e) {
            \Log::error('Blog comment creation error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to create comment: ' . $e->getMessage());
        }
    }

    public function show(BlogComments $blogsComment)
    {
        try {
            return Inertia::render('Admin/BlogsComments/Show', [
                'blogComment' => $blogsComment->load(['blog', 'user'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Blog comment show error: ' . $e->getMessage());
            return back()->with('error', 'Failed to load comment details.');
        }
    }

    public function edit(BlogComments $blogsComment)
    {
        try {
            $blogs = Blog::where('status', 'published')
                        ->orderBy('title')
                        ->get(['id', 'title']);

            return Inertia::render('Admin/BlogsComments/Edit', [
                'blogComment' => $blogsComment->load(['blog', 'user']),
                'blogs' => $blogs
            ]);
        } catch (\Exception $e) {
            \Log::error('Blog comment edit page error: ' . $e->getMessage());
            return back()->with('error', 'Failed to load edit form.');
        }
    }

    public function update(BlogCommentsRequest $request, BlogComments $blogsComment)
    {
        try {
            $this->blogCommentsRepo->update($blogsComment->id, $request->validated());

            return to_route('admin.blogscomments.index')
                ->with('success', 'Comment successfully updated!');

        } catch (\Exception $e) {
            \Log::error('Blog comment update error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to update comment: ' . $e->getMessage());
        }
    }

    public function destroy(BlogComments $blogsComment)
    {
        try {
            $this->blogCommentsRepo->delete($blogsComment->id);
            
            return to_route('admin.blogscomments.index')
                ->with('success', 'Comment successfully deleted!');

        } catch (\Exception $e) {
            \Log::error('Blog comment deletion error: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete comment.');
        }
    }
}
