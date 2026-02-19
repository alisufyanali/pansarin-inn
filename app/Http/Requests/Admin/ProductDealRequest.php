<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductDealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('deal')?->id;

        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:deals,slug,' . $id,
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'deal_type' => 'required|in:percentage,fixed,buy_x_get_y,bundle,flash_sale',
            'discount_value' => 'required_if:deal_type,percentage,fixed|nullable|numeric|min:0',
            'min_quantity' => 'required_if:deal_type,buy_x_get_y|nullable|integer|min:1',
            'free_quantity' => 'required_if:deal_type,buy_x_get_y|nullable|integer|min:0',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'badge_text' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:7',
            'display_order' => 'nullable|integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'products' => 'required|array|min:1',
            'products.*.id' => 'required|exists:products,id',
            'products.*.custom_discount' => 'nullable|numeric|min:0',
            'products.*.stock_limit' => 'nullable|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Deal title is required.',
            'title.max' => 'Deal title cannot exceed 255 characters.',
            'slug.unique' => 'This slug is already taken.',
            'image.image' => 'File must be an image.',
            'image.max' => 'Image size cannot exceed 2MB.',
            'deal_type.required' => 'Deal type is required.',
            'deal_type.in' => 'Invalid deal type selected.',
            'discount_value.required_if' => 'Discount value is required for this deal type.',
            'discount_value.min' => 'Discount value must be at least 0.',
            'min_quantity.required_if' => 'Buy quantity is required for Buy X Get Y deals.',
            'min_quantity.min' => 'Buy quantity must be at least 1.',
            'free_quantity.required_if' => 'Free quantity is required for Buy X Get Y deals.',
            'free_quantity.min' => 'Free quantity must be at least 0.',
            'min_purchase_amount.min' => 'Minimum purchase amount must be at least 0.',
            'max_uses.min' => 'Maximum uses must be at least 1.',
            'max_uses_per_user.min' => 'Maximum uses per user must be at least 1.',
            'ends_at.after' => 'End date must be after start date.',
            'badge_text.max' => 'Badge text cannot exceed 50 characters.',
            'badge_color.max' => 'Badge color must be a valid hex color code.',
            'products.required' => 'At least one product must be selected.',
            'products.min' => 'At least one product must be selected.',
            'products.*.id.required' => 'Product ID is required.',
            'products.*.id.exists' => 'Selected product does not exist.',
            'products.*.custom_discount.min' => 'Custom discount must be at least 0.',
            'products.*.stock_limit.min' => 'Stock limit must be at least 1.',
        ];
    }
}
