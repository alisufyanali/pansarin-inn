<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CouponRequest extends FormRequest
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
        $couponId = $this->route('coupon') ? $this->route('coupon') : null;

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('coupons', 'code')->ignore($couponId),
            ],
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'apply_to' => 'required|in:order,product,category',
            'product_id' => 'nullable|exists:products,id|required_if:apply_to,product',
            'category_id' => 'nullable|exists:categories,id|required_if:apply_to,category',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
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
            'code' => 'coupon code',
            'description' => 'description',
            'discount_type' => 'discount type',
            'discount_value' => 'discount value',
            'apply_to' => 'apply to',
            'product_id' => 'product',
            'category_id' => 'category',
            'min_purchase_amount' => 'minimum purchase amount',
            'max_discount_amount' => 'maximum discount amount',
            'usage_limit' => 'usage limit',
            'per_user_limit' => 'per user limit',
            'start_date' => 'start date',
            'end_date' => 'end date',
            'is_active' => 'active status',
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
            'code.required' => 'The coupon code is required.',
            'code.unique' => 'This coupon code already exists.',
            'discount_type.required' => 'Please select a discount type.',
            'discount_type.in' => 'The discount type must be percentage or fixed.',
            'discount_value.required' => 'The discount value is required.',
            'discount_value.min' => 'The discount value must be at least 0.',
            'apply_to.required' => 'Please select where to apply this coupon.',
            'apply_to.in' => 'The apply to field must be order, product, or category.',
            'product_id.required_if' => 'Please select a product when applying to product.',
            'category_id.required_if' => 'Please select a category when applying to category.',
            'end_date.after_or_equal' => 'The end date must be after or equal to start date.',
        ];
    }
}
