<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BulkInventoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'product_id'           => 'required|exists:products,id',
            'type'                 => 'required|in:in,out,adjustment,return',
            'cost_price'           => 'nullable|numeric|min:0',
            'reference'            => 'nullable|string|max:255',
            'source'               => 'nullable|string|max:100',
            'note'                 => 'nullable|string',
            'variants'             => 'required|array|min:1',
            'variants.*.variant_id'=> 'nullable|exists:product_variants,id',
            'variants.*.quantity'  => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required'          => 'Please select a product.',
            'variants.required'            => 'At least one variant required.',
            'variants.*.quantity.required' => 'Quantity required for each variant.',
            'variants.*.quantity.min'      => 'Quantity cannot be negative.',
        ];
    }
}