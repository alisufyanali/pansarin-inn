<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'order_number' => 'nullable|string|max:100',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000',
            'status' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Product is required.',
            'product_id.exists' => 'Selected product does not exist.',
            'customer_name.required' => 'Customer name is required.',
            'customer_name.max' => 'Customer name cannot exceed 255 characters.',
            'customer_email.email' => 'Please provide a valid email address.',
            'customer_email.max' => 'Email cannot exceed 255 characters.',
            'order_number.max' => 'Order number cannot exceed 100 characters.',
            'rating.required' => 'Rating is required.',
            'rating.min' => 'Rating must be at least 1.',
            'rating.max' => 'Rating cannot exceed 5.',
            'comment.required' => 'Review comment is required.',
            'comment.min' => 'Review must be at least 10 characters.',
            'comment.max' => 'Review cannot exceed 1000 characters.',
        ];
    }
}
