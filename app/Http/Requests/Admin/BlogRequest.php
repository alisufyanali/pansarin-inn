<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('blog')?->id;

        return [
            'blog_category_id' => 'nullable|exists:blog_categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug,'.$id,
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'nullable|in:draft,published',
            'thumbnail' => 'nullable|image|max:2048',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'schema_markup' => 'nullable|string',
            'social_image' => 'nullable|image|max:2048',
            'social_description' => 'nullable|string|max:300',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Blog title is required.',
            'slug.unique' => 'This slug is already taken.',
            'blog_category_id.exists' => 'Selected category does not exist.',
            'status.in' => 'Status must be either draft or published.',
            'thumbnail.image' => 'Thumbnail must be an image file.',
            'thumbnail.max' => 'Thumbnail size cannot exceed 2MB.',
            'social_image.image' => 'Social image must be an image file.',
            'social_image.max' => 'Social image size cannot exceed 2MB.',
            'excerpt.max' => 'Excerpt cannot exceed 500 characters.',
            'meta_title.max' => 'Meta title cannot exceed 60 characters.',
            'meta_description.max' => 'Meta description cannot exceed 160 characters.',
            'social_description.max' => 'Social description cannot exceed 300 characters.',
            'tags.*.exists' => 'One or more selected tags do not exist.',
        ];
    }
}
