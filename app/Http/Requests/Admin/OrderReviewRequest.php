<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class OrderReviewRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_id'    => 'required|exists:orders,id',
            'customer_id' => 'required|exists:customers,id',
            'rating'      => 'required|integer|min:1|max:5',
            'review'      => 'nullable|string|max:2000',
            'status'      => 'required|in:pending,approved,rejected',
            'admin_reply' => 'nullable|string|max:2000',
        ];
    }
}
