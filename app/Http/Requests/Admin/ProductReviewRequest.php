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
            'user_id'    => 'required|exists:users,id',
            'rating'     => 'required|integer|min:1|max:5',
            'review'     => 'nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Product is required.',
            'product_id.exists'   => 'Selected product does not exist.',
            'user_id.required'    => 'User is required.',
            'user_id.exists'      => 'Selected user does not exist.',
            'rating.required'     => 'Rating is required.',
            'rating.min'          => 'Rating must be at least 1.',
            'rating.max'          => 'Rating cannot exceed 5.',
        ];
    }
}
