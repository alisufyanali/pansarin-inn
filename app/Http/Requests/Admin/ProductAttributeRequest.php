<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('attribute')?->id;

        return [
            'name' => 'required|string|max:255|unique:attributes,name,'.$id,
            'values' => 'required|array|min:1',
            'values.*' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Attribute name is required.',
            'name.unique' => 'This attribute name already exists.',
            'values.required' => 'At least one attribute value is required.',
            'values.min' => 'At least one attribute value is required.',
            'values.*.required' => 'Attribute value cannot be empty.',
            'values.*.max' => 'Attribute value cannot exceed 255 characters.',
        ];
    }
}
