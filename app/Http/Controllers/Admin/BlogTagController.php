<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\BlogTagRepository;
use App\Http\Requests\Admin\BlogTagRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogTagController extends Controller
{
    protected $blogTagRepo;

    public function __construct(BlogTagRepository $blogTagRepo)
    {
        $this->blogTagRepo = $blogTagRepo;

        $this->middleware('permission:create.blogtags')->only(['create', 'store']);
        $this->middleware('permission:edit.blogtags')->only(['edit', 'update']);
        $this->middleware('permission:delete.blogtags')->only(['destroy']);
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/BlogTags/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $this->blogTagRepo->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        return $this->blogTagRepo->getAllForDataTable($request);
    }

    public function create()
    {
        return Inertia::render('Admin/BlogTags/Create');
    }

    public function store(BlogTagRequest $request)
    {
        try {
            $this->blogTagRepo->store($request->validated());

            return to_route('admin.blogtags.index')
                ->with('success', 'Blog tag successfully created!');

        } catch (\Exception $e) {
            \Log::error('Blog tag creation error: '.$e->getMessage());

            return back()->withErrors(['error' => 'Failed to create blog tag.']);
        }
    }

    public function show($id)
    {
        $blogTag = $this->blogTagRepo->find($id);

        return Inertia::render('Admin/BlogTags/Show', [
            'blogTag' => $blogTag->load('blogs'),
        ]);
    }

    public function edit($id)
    {
        $blogTag = $this->blogTagRepo->find($id);

        return Inertia::render('Admin/BlogTags/Edit', [
            'blogTag' => $blogTag,
        ]);
    }

    public function update(BlogTagRequest $request, $id)
    {
        try {
            $this->blogTagRepo->update($id, $request->validated());

            return to_route('admin.blogtags.index')
                ->with('success', 'Blog tag successfully updated!');

        } catch (\Exception $e) {
            \Log::error('Blog tag update error: '.$e->getMessage());

            return back()->withErrors(['error' => 'Failed to update blog tag.']);
        }
    }

    public function destroy($id)
    {
        try {
            $this->blogTagRepo->delete($id);

            return to_route('admin.blogtags.index')
                ->with('success', 'Blog tag successfully deleted!');

        } catch (\Exception $e) {
            \Log::error('Blog tag deletion error: '.$e->getMessage());

            return back()->with('error', $e->getMessage());
        }
    }
}
