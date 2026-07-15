<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerRequest extends FormRequest
{
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
        $customer = $this->route('customer');
        if (is_numeric($customer) || is_string($customer)) {
            $customer = \App\Models\Customer::find($customer);
        }
        
        $userId = $customer instanceof \App\Models\Customer ? $customer->user_id : null;
        $customerId = $customer instanceof \App\Models\Customer ? $customer->id : null;

        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('customers', 'phone')->ignore($customerId),
                Rule::unique('users', 'phone')->ignore($userId),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
                Rule::unique('customers', 'email')->ignore($customerId),
            ],
            'address'  => 'nullable|string|max:255',
            'address2' => 'nullable|string|max:255',
            'city_id'  => 'nullable|exists:cities,id',
            'country'  => 'nullable|string|max:100',
            'password' => 'nullable|string|min:8',
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
            'first_name' => 'first name',
            'last_name' => 'last name',
            'phone' => 'phone number',
            'email' => 'email address',
            'address' => 'address',
            'city_id' => 'city',
            'country' => 'country',
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
            'first_name.required' => 'The first name is required.',
            'phone.required' => 'The phone number is required.',
            'phone.unique' => 'This phone number is already registered.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'city_id.exists' => 'The selected city is invalid.',
        ];
    }
}
