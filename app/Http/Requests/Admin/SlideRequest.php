<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SlideRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'type'       => 'required|in:desktop,mobile',
            'title'      => 'nullable|string|max:255',
            'subtitle'   => 'nullable|string|max:500',
            'btn_text'   => 'nullable|string|max:100',
            'btn_url'    => 'nullable|string|max:500',
            'image'      => 'nullable|image|max:5120',
            'sort_order' => 'nullable|integer|min:0',
            'is_active'  => 'nullable|boolean',
        ];
    }
}
