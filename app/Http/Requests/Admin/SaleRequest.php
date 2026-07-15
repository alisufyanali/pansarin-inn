<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaleRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'order_id' => 'nullable|exists:orders,id',
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'invoice_discount' => 'nullable|numeric|min:0',
            'vat' => 'nullable|numeric|min:0',
            'vat_percent' => 'nullable|string',
            'shipping_charges' => 'nullable|numeric|min:0',
            'delivery_status' => 'required|in:pending,processing,shipped,delivered,cancelled,returned',
            'payment_status' => 'required|in:unpaid,paid,partially_paid,refunded',
            'payment_type' => 'nullable|string|max:100',
            'payment_timestamp' => 'nullable|date',
            'shipping_method' => 'nullable|in:leopard,cc,pp,px,movex,tcs,trax,rider',
            'courier_weight'  => 'nullable|numeric|min:0.1',
            'city_id'         => 'nullable|exists:cities,id',
            'shipping_address' => 'nullable|string',
            'shipping_response' => 'nullable|string',
            'delivery_datetime' => 'nullable|date',
            'remarks' => 'nullable|string',
            'review' => 'nullable|string',
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'order_id.exists' => 'Selected order does not exist',
            'customer_id.required' => 'Customer is required',
            'customer_id.exists' => 'Selected customer does not exist',
            'items.required' => 'At least one item is required',
            'items.min' => 'At least one item is required',
            'items.*.product_id.required' => 'Product is required for each item',
            'items.*.product_id.exists' => 'Selected product does not exist',
            'items.*.quantity.required' => 'Quantity is required for each item',
            'items.*.quantity.min' => 'Quantity must be at least 1',
            'items.*.price.required' => 'Price is required for each item',
            'items.*.price.min' => 'Price cannot be negative',
            'delivery_status.required' => 'Delivery status is required',
            'delivery_status.in' => 'Invalid delivery status',
            'payment_status.required' => 'Payment status is required',
            'payment_status.in' => 'Invalid payment status',
        ];
    }
}
