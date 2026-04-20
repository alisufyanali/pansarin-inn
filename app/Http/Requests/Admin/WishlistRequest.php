<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class WishlistRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user_id'            => 'required|exists:users,id',
            'product_id'         => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required'          => 'User is required.',
            'user_id.exists'            => 'Selected user does not exist.',
            'product_id.required'       => 'Product is required.',
            'product_id.exists'         => 'Selected product does not exist.',
            'product_variant_id.exists' => 'Selected product variant does not exist.',
        ];
    }
}
