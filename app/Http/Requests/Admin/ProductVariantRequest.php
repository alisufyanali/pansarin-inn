<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductVariantRequest extends FormRequest
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
     */
    public function rules(): array
    {
        $variantId = $this->route('product_variant');

        return [
            'product_id' => 'required|exists:products,id',
            'sku' => 'required|string|unique:product_variants,sku,' . $variantId,
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_default' => 'boolean',
            'status' => 'boolean',
            'attributes' => 'nullable|string',
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Product is required',
            'product_id.exists' => 'Selected product does not exist',
            'sku.required' => 'SKU is required',
            'sku.unique' => 'This SKU already exists',
            'price.required' => 'Price is required',
            'price.numeric' => 'Price must be a number',
            'price.min' => 'Price cannot be negative',
            'stock.required' => 'Stock is required',
            'stock.integer' => 'Stock must be a whole number',
            'stock.min' => 'Stock cannot be negative',
        ];
    }
}
