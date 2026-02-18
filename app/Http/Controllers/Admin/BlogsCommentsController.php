<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogComments;
use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class BlogsCommentsController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view.blogcomments')->only(['index', 'getData', 'show']);
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
            'avg_rating' => round(BlogComments::whereNotNull('rating')->avg('rating') ?? 0, 1),
        ];

        return Inertia::render('Admin/BlogsComments/Index', [
            'userRole' => $request->user()->role ?? 'admin',
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        try {
            // Base query with eager loading
            $query = BlogComments::query()
                ->with(['blog:id,title', 'user:id,name'])
                ->select('id', 'blog_id', 'user_id', 'comments', 'review', 'rating', 'status', 'created_at', 'updated_at');

            // Search functionality
            if ($request->filled('search')) {
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

            // Blog filter
            if ($request->filled('blog_id')) {
                $query->where('blog_id', $request->blog_id);
            }

            // Status filter
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Rating filter
            if ($request->filled('rating')) {
                $query->where('rating', $request->rating);
            }

            // Sorting
            $sortBy = $request->get('sortBy', 'created_at');
            $sortOrder = $request->get('sortOrder', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('perPage', 10);
            $page = $request->get('page', 1);
            
            $comments = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform data to include related fields
            $transformedData = $comments->map(function($comment) {
                return [
                    'id' => $comment->id,
                    'blog_id' => $comment->blog_id,
                    'user_id' => $comment->user_id,
                    'comments' => $comment->comments,
                    'review' => $comment->review,
                    'rating' => $comment->rating,
                    'status' => $comment->status,
                    'created_at' => $comment->created_at,
                    'updated_at' => $comment->updated_at,
                    'blog_title' => $comment->blog?->title ?? 'N/A',
                    'user_name' => $comment->user?->name ?? 'Guest',
                    'blog' => $comment->blog,
                    'user' => $comment->user,
                ];
            });

            return response()->json([
                'data' => $transformedData,
                'total' => $comments->total(),
                'per_page' => $comments->perPage(),
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
            ]);

        } catch (\Exception $e) {
            Log::error('Blog comments getData error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
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
        try {
            // Get all published blogs
            $blogs = Blog::where('status', 'published')
                        ->orderBy('title')
                        ->get(['id', 'title']);

            return Inertia::render('Admin/BlogsComments/Create', [
                'blogs' => $blogs
            ]);
        } catch (\Exception $e) {
            Log::error('Blog comments create page error: ' . $e->getMessage());
            return back()->with('error', 'Failed to load create form.');
        }
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

        return to_route('admin.blogscomments.index') // FIXED - lowercase
            ->with('success', 'Comment successfully created!');

    } catch (\Exception $e) {
        Log::error('Blog comment creation error: ' . $e->getMessage());
        return back()
            ->withInput()
            ->with('error', 'Failed to create comment: ' . $e->getMessage());
    }
}
    

    public function show(BlogComments $blogsComment)
    {
        try {
            return Inertia::render('Admin/BlogsComments/Show', [
                'blogComment' => $blogsComment->load(['blog', 'user'])
            ]);
        } catch (\Exception $e) {
            Log::error('Blog comment show error: ' . $e->getMessage());
            return back()->with('error', 'Failed to load comment details.');
        }
    }

    public function edit(BlogComments $blogsComment)
    {
        try {
            // Get all published blogs
            $blogs = Blog::where('status', 'published')
                        ->orderBy('title')
                        ->get(['id', 'title']);

            return Inertia::render('Admin/BlogsComments/Edit', [
                'blogComment' => $blogsComment->load(['blog', 'user']),
                'blogs' => $blogs
            ]);
        } catch (\Exception $e) {
            Log::error('Blog comment edit page error: ' . $e->getMessage());
            return back()->with('error', 'Failed to load edit form.');
        }
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

        return to_route('admin.blogscomments.index') // FIXED - lowercase
            ->with('success', 'Comment successfully updated!');

    } catch (\Exception $e) {
        Log::error('Blog comment update error: ' . $e->getMessage());
        return back()
            ->withInput()
            ->with('error', 'Failed to update comment: ' . $e->getMessage());
    }
}

    public function destroy(BlogComments $blogsComment)
{
    try {
        $blogsComment->delete();
        
        return to_route('admin.blogscomments.index') // FIXED - lowercase
            ->with('success', 'Comment successfully deleted!');

    } catch (\Exception $e) {
        Log::error('Blog comment deletion error: ' . $e->getMessage());
        return back()->with('error', 'Failed to delete comment.');
    }
}
}