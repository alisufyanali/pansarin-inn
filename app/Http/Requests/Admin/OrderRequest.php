<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation()
    {
        if ($this->has('city_id') && $this->input('city_id') === '') {
            $this->merge(['city_id' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'customer_id'           => 'required|exists:customers,id',
            'city_id'               => 'required|exists:cities,id',
            'items'                 => 'required|array|min:1',
            // A line is a catalog product, or a custom item typed in by name (no inventory)
            'items.*.product_id'    => 'nullable|required_without:items.*.custom_name|exists:products,id',
            'items.*.custom_name'   => 'nullable|required_without:items.*.product_id|string|max:255',
            'items.*.custom_variant' => 'nullable|string|max:100',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.price'         => 'required|numeric|min:0',
            'items.*.discount'      => 'nullable|numeric|min:0',
            'invoice_discount'      => 'nullable|numeric|min:0',
            'shipping_charges'      => 'required|numeric|min:0',
            'tax'                   => 'nullable|numeric|min:0',
            'status'                => 'required|in:pending,processing,shipped,delivered,cancelled,refunded',
            'payment_status'        => 'required|in:unpaid,paid,partially_paid,refunded',
            'payment_method'        => 'nullable|string|max:100',
            'payment_date'          => 'nullable|date',
            'shipping_method'       => 'nullable|string|max:100',
            'courier_weight'        => 'nullable|string|max:50',
            'shipping_address'      => 'nullable|string',
            'billing_address'       => 'nullable|string',
            'order_note'            => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'items.*.product_id.required_without'  => 'Select a product or type a custom item name for each line',
            'items.*.custom_name.required_without' => 'Select a product or type a custom item name for each line',
        ];
    }
}