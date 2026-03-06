<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class InventoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'product_id'         => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity'           => 'required|numeric|min:0.01',
            'type'               => 'required|in:in,out,adjustment,return',
            'cost_price'         => 'nullable|numeric|min:0',
            'reference'          => 'nullable|string|max:255',
            'source'             => 'nullable|string|max:100',
            'note'               => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required'  => 'Please select a product.',
            'product_id.exists'    => 'The selected product is invalid.',
            'quantity.required'    => 'Quantity is required.',
            'quantity.min'         => 'Quantity must be at least 0.01.',
            'type.required'        => 'Please select transaction type.',
            'type.in'              => 'Type must be: in, out, adjustment, or return.',
        ];
    }
}