<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'customer_id'           => 'required|exists:customers,id',
            'city_id'               => 'nullable|exists:cities,id',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.price'         => 'required|numeric|min:0',
            'items.*.discount'      => 'nullable|numeric|min:0',
            'invoice_discount'      => 'nullable|numeric|min:0',
            'shipping_charges'      => 'nullable|numeric|min:0',
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
}