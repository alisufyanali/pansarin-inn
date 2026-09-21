<?php

namespace App\Support;

use App\Models\Order;
use App\Models\Sale;

class OrderMailRecipient
{
    public static function forOrder(Order $order): ?string
    {
        $order->loadMissing('customer');
        $email = $order->customer_email ?: $order->customer?->email;

        return $email ?: config('mail.order_fallback_address');
    }

    public static function forSale(Sale $sale): ?string
    {
        $sale->loadMissing('customer');
        $email = $sale->customer_email ?: $sale->customer?->email;

        return $email ?: config('mail.order_fallback_address');
    }
}
