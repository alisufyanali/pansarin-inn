<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        // If it's a string (ID), use it directly; if it's a model, get the ID
        $id = is_object($productId) ? $productId->id : $productId;

        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,'.$id,
            'sku' => 'nullable|string|max:255',
            'barcode' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'short_description' => 'nullable|string|max:500',
            'long_description' => 'nullable|string',
            'urdu_name' => 'nullable|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'alternative_name' => 'nullable|string|max:255',
            'other_name' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:50',
            'quantity' => 'nullable|numeric|min:0',
            'purchase_price_per_unit' => 'nullable|numeric|min:0',
            'sale_price_per_unit' => 'nullable|numeric|min:0',
            'price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock_qty' => 'nullable|integer|min:0',
            'stock_alert' => 'nullable|integer|min:0',
            'status' => 'sometimes|boolean',
            'featured' => 'sometimes|boolean',
            'thumbnail' => 'nullable|image|max:2048',
            'social_image' => 'nullable|image|max:2048',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'schema_markup' => 'nullable|string',
            'social_description' => 'nullable|string|max:300',
            'tags' => 'nullable|array',
            'selected_attributes' => 'nullable|array',
            'variations' => 'nullable|array',
            'variations.*.combination' => 'nullable|string',
            'variations.*.attributes' => 'nullable|array',
            'variations.*.qty' => 'nullable|numeric|min:0',
            'variations.*.purchase_price' => 'nullable|numeric|min:0',
            'variations.*.sale_price' => 'nullable|numeric|min:0',
            // 'affiliate_commission' => 'required|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'category_id.required' => 'Category is required.',
            'category_id.exists' => 'Selected category does not exist.',
            'price.required' => 'Price is required.',
            'price.min' => 'Price must be at least 0.',
            'thumbnail.image' => 'Thumbnail must be an image.',
            'thumbnail.max' => 'Thumbnail size cannot exceed 2MB.',
            'social_image.image' => 'Social image must be an image.',
            'social_image.max' => 'Social image size cannot exceed 2MB.',
            'gallery.*.image' => 'All gallery files must be images.',
            'gallery.*.max' => 'Gallery images cannot exceed 2MB each.',
        ];
    }
}
