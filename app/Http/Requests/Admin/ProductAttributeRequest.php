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
            'values.*.value' => 'required|numeric',
            'values.*.slug' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Attribute name is required.',
            'name.unique' => 'This attribute name already exists.',
            'values.required' => 'At least one attribute value is required.',
            'values.min' => 'At least one attribute value is required.',
            'values.*.value.required' => 'Value field cannot be empty.',
            'values.*.value.numeric' => 'Value must be a number.',
            'values.*.slug.required' => 'Slug field cannot be empty.',
            'values.*.slug.max' => 'Slug cannot exceed 255 characters.',
        ];
    }
}
