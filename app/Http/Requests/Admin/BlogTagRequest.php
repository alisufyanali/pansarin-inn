<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BlogTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Edit mode mein id route se milega
        $blogtag = $this->route('blogtag');
        $id = is_object($blogtag) ? $blogtag->id : $blogtag;

        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_tags,slug,'.$id,
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7', // Hex color code
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tag name is required.',
            'name.max' => 'Tag name cannot exceed 255 characters.',
            'slug.unique' => 'This slug is already taken.',
            'description.max' => 'Description cannot exceed 500 characters.',
            'color.max' => 'Color code must be a valid hex color.',
        ];
    }

    /**
     * Prepare data for validation
     */
    protected function prepareForValidation()
    {
        // Convert is_active to boolean if it's a string
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}
