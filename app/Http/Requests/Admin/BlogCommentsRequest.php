<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BlogCommentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'blog_id'  => 'nullable|exists:blogs,id',
            'comments' => 'required|string|min:3|max:1000',
            'review'   => 'nullable|string|max:2000',
            'rating'   => 'nullable|integer|min:1|max:5',
            'status'   => 'nullable|in:pending,approved,rejected',
        ];
    }

    public function messages(): array
    {
        return [
            'blog_id.exists'    => 'Selected blog does not exist.',
            'comments.required' => 'Comment text is required.',
            'comments.min'      => 'Comment must be at least 3 characters.',
            'comments.max'      => 'Comment cannot exceed 1000 characters.',
            'review.max'        => 'Review cannot exceed 2000 characters.',
            'rating.integer'    => 'Rating must be a number.',
            'rating.min'        => 'Rating must be at least 1.',
            'rating.max'        => 'Rating cannot exceed 5.',
            'status.in'         => 'Status must be pending, approved, or rejected.',
        ];
    }
}
