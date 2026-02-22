<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NewsletterRequest extends FormRequest
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
        $newsletterId = $this->route('newsletter') ? $this->route('newsletter')->id : null;

        return [
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('newsletters', 'email')->ignore($newsletterId),
            ],
            'name' => 'nullable|string|max:255',
            'status' => 'required|in:active,unsubscribed,bounced',
            'source' => 'nullable|string|max:255',
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
            'email' => 'email address',
            'name' => 'subscriber name',
            'status' => 'subscription status',
            'source' => 'subscription source',
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
            'email.required' => 'The email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already subscribed.',
            'status.required' => 'The subscription status is required.',
            'status.in' => 'The status must be active, unsubscribed, or bounced.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Add IP address and user agent if not present
        if (! $this->has('ip_address')) {
            $this->merge([
                'ip_address' => $this->ip(),
            ]);
        }

        if (! $this->has('user_agent')) {
            $this->merge([
                'user_agent' => $this->userAgent(),
            ]);
        }
    }
}
