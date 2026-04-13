<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $cityId = $this->route('city') ? $this->route('city') : null;

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('cities', 'name')->ignore($cityId)->whereNull('deleted_at'),
            ],
            'shipping_charges' => 'required|numeric|min:0',
            'province' => [
                'required',
                Rule::in(['sindh', 'punjab', 'balochistan', 'kpk', 'gilgit', 'azad_kashmir']),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'             => 'city name',
            'shipping_charges' => 'shipping charges',
            'province'         => 'province',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'The city name is required.',
            'name.unique'               => 'This city name already exists.',
            'shipping_charges.required' => 'Shipping charges are required.',
            'shipping_charges.min'      => 'Shipping charges must be at least 0.',
            'province.required'         => 'Please select a province.',
            'province.in'               => 'Invalid province selected.',
        ];
    }
}
