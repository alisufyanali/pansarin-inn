<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BlogCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Edit mode mein id route se milega
        $blogcategory = $this->route('blogcategory');
        $id = is_object($blogcategory) ? $blogcategory->id : $blogcategory;

        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug,'.$id,
            'parent_id' => 'nullable|exists:blog_categories,id',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'schema_markup' => 'nullable|string',
            'social_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'social_description' => 'nullable|string|max:300',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required.',
            'slug.unique' => 'This slug is already taken.',
            'parent_id.exists' => 'Selected parent category does not exist.',
            'meta_title.max' => 'Meta title cannot exceed 60 characters.',
            'meta_description.max' => 'Meta description cannot exceed 160 characters.',
            'social_image.image' => 'Social image must be an image file.',
            'social_image.max' => 'Social image size cannot exceed 2MB.',
            'social_description.max' => 'Social description cannot exceed 300 characters.',
        ];
    }
}
