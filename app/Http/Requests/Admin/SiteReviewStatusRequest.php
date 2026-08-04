<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SiteReviewStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'     => 'required|in:pending,approved,rejected',
            'admin_note' => 'nullable|string|max:1000',
        ];
    }
}
