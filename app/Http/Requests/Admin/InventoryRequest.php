<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class InventoryRequest extends FormRequest
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
        return [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.01',
            'type' => 'required|in:in,out',
            'reference' => 'nullable|string|max:255',
            'note' => 'nullable|string',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'product_id' => 'product',
            'quantity' => 'quantity',
            'type' => 'transaction type',
            'reference' => 'reference',
            'note' => 'note',
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
            'product_id.required' => 'Please select a product.',
            'product_id.exists' => 'The selected product is invalid.',
            'quantity.required' => 'The quantity is required.',
            'quantity.min' => 'The quantity must be at least 0.01.',
            'type.required' => 'Please select transaction type (Stock In/Out).',
            'type.in' => 'The transaction type must be either in or out.',
        ];
    }
}
