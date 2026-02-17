<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('category')?->id;

        return [
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'boolean',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'schema_markup' => 'nullable|string',
            'social_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'social_description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required.',
            'parent_id.exists' => 'Selected parent category does not exist.',
            'image.image' => 'File must be an image.',
            'image.max' => 'Image size cannot exceed 2MB.',
            'social_image.image' => 'Social image must be an image file.',
            'social_image.max' => 'Social image size cannot exceed 2MB.',
        ];
    }
}
