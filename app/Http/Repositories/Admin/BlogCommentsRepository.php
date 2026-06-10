<?php

namespace App\Http\Repositories\Admin;

use App\Models\BlogComments;

class BlogCommentsRepository
{
    public function getAll()
    {
        return BlogComments::with(['blog', 'user'])->latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = BlogComments::with(['blog:id,title', 'user:id,name'])
            ->select('id', 'blog_id', 'user_id', 'comments', 'review', 'rating', 'status', 'created_at', 'updated_at');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('comments', 'like', "%{$search}%")
                    ->orWhere('review', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhereHas('blog', fn ($q) => $q->where('title', 'like', "%{$search}%"))
                    ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        // Filters
        if ($request->filled('blog_id')) {
            $query->where('blog_id', $request->blog_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

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

        // Transform data
        $transformedData = $comments->map(function ($comment) {
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
    }

    public function find($id)
    {
        return BlogComments::findOrFail($id);
    }

    public function store(array $data)
    {
        if (empty($data['blog_id'])) {
            throw new \Exception('Blog ID is required.');
        }

        $data['user_id'] = auth()->id();

        if (empty($data['status'])) {
            $data['status'] = 'pending';
        }

        return BlogComments::create($data);
    }

    public function update($id, array $data)
    {
        $comment = $this->find($id);
        $comment->update($data);

        return $comment;
    }

    public function delete($id)
    {
        $comment = $this->find($id);

        return $comment->delete();
    }

    public function getStats()
    {
        return [
            'total' => BlogComments::count(),
            'pending' => BlogComments::where('status', 'pending')->count(),
            'approved' => BlogComments::where('status', 'approved')->count(),
            'rejected' => BlogComments::where('status', 'rejected')->count(),
            'with_rating' => BlogComments::whereNotNull('rating')->count(),
            'avg_rating' => round(BlogComments::whereNotNull('rating')->avg('rating') ?? 0, 1),
        ];
    }
}
