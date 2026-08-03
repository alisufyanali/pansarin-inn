<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class HealthConcernRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:255',
            'icon'       => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'status'     => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Health concern name is required.',
            'icon.image'    => 'Icon must be an image file.',
            'icon.max'      => 'Icon size cannot exceed 2MB.',
        ];
    }
}
