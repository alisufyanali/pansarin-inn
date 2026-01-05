<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogComments;
use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class BlogsCommentsController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:create.blogcomments')->only(['create', 'store']);
        $this->middleware('permission:edit.blogcomments')->only(['edit', 'update']);
        $this->middleware('permission:delete.blogcomments')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $stats = [
            'total' => BlogComments::count(),
            'pending' => BlogComments::where('status', 'pending')->count(),
            'approved' => BlogComments::where('status', 'approved')->count(),
            'rejected' => BlogComments::where('status', 'rejected')->count(),
            'with_rating' => BlogComments::whereNotNull('rating')->count(),
            'avg_rating' => round(BlogComments::whereNotNull('rating')->avg('rating'), 1),
        ];

        return Inertia::render('Admin/BlogsComments/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        $query = BlogComments::with(['blog', 'user'])->latest();
        
        if ($request->has('search') && $request->search !== '') {
            if (is_string($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('comments', 'like', "%{$search}%")
                      ->orWhere('review', 'like', "%{$search}%")
                      ->orWhere('id', 'like', "%{$search}%")
                      ->orWhereHas('blog', function($q) use ($search) {
                          $q->where('title', 'like', "%{$search}%");
                      })
                      ->orWhereHas('user', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            }
        }

        // Blog filter
        if ($request->has('blog_id') && $request->blog_id !== '') {
            $query->where('blog_id', $request->blog_id);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('rating') && $request->rating !== '') {
            $query->where('rating', $request->rating);
        }

        return DataTables::of($query)
            ->addColumn('blog_title', function($comment) {
                return $comment->blog ? $comment->blog->title : 'N/A';
            })
            ->addColumn('user_name', function($comment) {
                return $comment->user ? $comment->user->name : 'Guest';
            })
            ->make(true);
    }

    public function create()
    {
        // ✅ FIXED: Get all published blogs
        $blogs = Blog::where('status', 'published')
                    ->orderBy('title')
                    ->get(['id', 'title']);

        return Inertia::render('Admin/BlogsComments/Create', [
            'blogs' => $blogs
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'blog_id' => 'nullable|exists:blogs,id',
                'comments' => 'required|string|min:3|max:1000',
                'review' => 'nullable|string|max:2000',
                'rating' => 'nullable|integer|min:1|max:5',
                'status' => 'nullable|in:pending,approved,rejected',
            ]);

            $validated['user_id'] = auth()->id();
            
            if (empty($validated['status'])) {
                $validated['status'] = 'pending';
            }

            BlogComments::create($validated);

            return to_route('blogsComments.index')->with('success', 'Comment successfully created!');
        } catch (\Exception $e) {
            \Log::error('Blog comment creation error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create comment: ' . $e->getMessage()]);
        }
    }

    public function show(BlogComments $blogsComment)
    {
        return Inertia::render('Admin/BlogsComments/Show', [
            'blogComment' => $blogsComment->load(['blog', 'user'])
        ]);
    }

    public function edit(BlogComments $blogsComment)
    {
        // ✅ FIXED: Get all published blogs
        $blogs = Blog::where('status', 'published')
                    ->orderBy('title')
                    ->get(['id', 'title']);

        return Inertia::render('Admin/BlogsComments/Edit', [
            'blogComment' => $blogsComment->load(['blog', 'user']),
            'blogs' => $blogs
        ]);
    }

    public function update(Request $request, BlogComments $blogsComment)
    {
        try {
            $validated = $request->validate([
                'blog_id' => 'nullable|exists:blogs,id',
                'comments' => 'required|string|min:3|max:1000',
                'review' => 'nullable|string|max:2000',
                'rating' => 'nullable|integer|min:1|max:5',
                'status' => 'nullable|in:pending,approved,rejected',
            ]);

            $blogsComment->update($validated);

            return to_route('blogsComments.index')->with('success', 'Comment successfully updated!');
        } catch (\Exception $e) {
            \Log::error('Blog comment update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update comment: ' . $e->getMessage()]);
        }
    }

    public function destroy(BlogComments $blogsComment)
    {
        try {
            $blogsComment->delete();
            
            return to_route('blogsComments.index')->with('success', 'Comment successfully deleted!');
        } catch (\Exception $e) {
            \Log::error('Blog comment deletion error: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete comment.');
        }
    }
}