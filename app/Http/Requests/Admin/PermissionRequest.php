<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PermissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $permissionId = $this->route('permission');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:permissions,name,' . $permissionId,
                'regex:/^[a-z0-9\-_.]+$/',
            ],
            'guard_name' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Permission name is required.',
            'name.unique' => 'This permission name already exists.',
            'name.regex' => 'Permission name can only contain lowercase letters, numbers, hyphens, underscores, and dots.',
            'name.max' => 'Permission name cannot exceed 255 characters.',
            'guard_name.max' => 'Guard name cannot exceed 255 characters.',
        ];
    }
}
