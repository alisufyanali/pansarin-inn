<x-mail-layout
    title="New Order — {{ $order->order_number }}"
    heading="🔔 New Order Received"
    subheading="A customer has placed a new order"
>

    <p style="margin:0 0 16px;font-size:14px;color:#1f2d1f;">
        <strong>Alert:</strong> A new order has been placed on your website.
    </p>

    <!-- Order meta -->
    <table width="100%" cellpadding="10" cellspacing="0" border="0"
           style="background-color:#fff3e0;border:1px solid #ffb74d;border-radius:6px;margin-bottom:24px;">
        <tr>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;">
                <strong style="color:#e65100;">Order Number:</strong>
            </td>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;text-align:right;">
                {{ $order->order_number }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;">
                <strong style="color:#e65100;">Customer:</strong>
            </td>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;text-align:right;">
                {{ $customer->first_name }} {{ $customer->last_name }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;">
                <strong style="color:#e65100;">Email:</strong>
            </td>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;text-align:right;">
                {{ $customer->email }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;">
                <strong style="color:#e65100;">Phone:</strong>
            </td>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;text-align:right;">
                {{ $customer->phone }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;">
                <strong style="color:#e65100;">Order Date:</strong>
            </td>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;text-align:right;">
                {{ $order->created_at->format('d M, Y h:i A') }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;">
                <strong style="color:#e65100;">Payment Status:</strong>
            </td>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #ffe0b2;text-align:right;">
                {{ ucfirst(str_replace('_', ' ', $order->payment_status)) }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;">
                <strong style="color:#e65100;">Order Status:</strong>
            </td>
            <td style="font-size:13px;color:#374151;text-align:right;">
                {{ ucfirst($order->status) }}
            </td>
        </tr>
    </table>

    <!-- Items table -->
    <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#e65100;">Order Items:</p>
    <table width="100%" cellpadding="10" cellspacing="0" border="0"
           style="border-collapse:collapse;margin-bottom:20px;font-size:13px;">
        <thead>
            <tr style="background-color:#ff6f00;">
                <th style="color:#ffffff;text-align:left;padding:10px 12px;">Product</th>
                <th style="color:#ffffff;text-align:center;padding:10px 12px;">Qty</th>
                <th style="color:#ffffff;text-align:right;padding:10px 12px;">Price</th>
                <th style="color:#ffffff;text-align:right;padding:10px 12px;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $index => $item)
            <tr style="background-color:{{ $index % 2 === 0 ? '#fff8f0' : '#ffffff' }};">
                <td style="padding:10px 12px;color:#374151;border-bottom:1px solid #ffe0b2;">
                    {{ $item->meta['product_name'] ?? $item->product->name }}
                    @if(isset($item->meta['variant_name']))
                        <br /><small style="color:#757575;">({{ $item->meta['variant_name'] }})</small>
                    @endif
                </td>
                <td style="padding:10px 12px;color:#374151;border-bottom:1px solid #ffe0b2;text-align:center;">
                    {{ $item->quantity }}
                </td>
                <td style="padding:10px 12px;color:#374151;border-bottom:1px solid #ffe0b2;text-align:right;">
                    PKR {{ number_format($item->price, 2) }}
                </td>
                <td style="padding:10px 12px;color:#374151;border-bottom:1px solid #ffe0b2;text-align:right;">
                    PKR {{ number_format($item->subtotal, 2) }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="8" cellspacing="0" border="0"
           style="font-size:13px;margin-bottom:24px;">
        <tr>
            <td style="text-align:right;color:#374151;"><strong>Subtotal:</strong></td>
            <td style="text-align:right;color:#374151;width:130px;">PKR {{ number_format($order->subtotal, 2) }}</td>
        </tr>
        @if($order->product_discount > 0)
        <tr>
            <td style="text-align:right;color:#374151;"><strong>Product Discount:</strong></td>
            <td style="text-align:right;color:#c62828;">− PKR {{ number_format($order->product_discount, 2) }}</td>
        </tr>
        @endif
        @if($order->invoice_discount > 0)
        <tr>
            <td style="text-align:right;color:#374151;"><strong>Invoice Discount:</strong></td>
            <td style="text-align:right;color:#c62828;">− PKR {{ number_format($order->invoice_discount, 2) }}</td>
        </tr>
        @endif
        @if($order->shipping_charges > 0)
        <tr>
            <td style="text-align:right;color:#374151;"><strong>Shipping:</strong></td>
            <td style="text-align:right;color:#374151;">+ PKR {{ number_format($order->shipping_charges, 2) }}</td>
        </tr>
        @endif
        @if($order->tax > 0)
        <tr>
            <td style="text-align:right;color:#374151;"><strong>Tax:</strong></td>
            <td style="text-align:right;color:#374151;">+ PKR {{ number_format($order->tax, 2) }}</td>
        </tr>
        @endif>
        <tr style="background-color:#ffe0b2;">
            <td style="text-align:right;padding:10px 8px;font-size:15px;font-weight:700;color:#e65100;">
                <strong>Grand Total:</strong>
            </td>
            <td style="text-align:right;padding:10px 8px;font-size:15px;font-weight:700;color:#e65100;">
                PKR {{ number_format($order->grand_total, 2) }}
            </td>
        </tr>
    </table>

    @if($order->shipping_address)
    <table width="100%" cellpadding="12" cellspacing="0" border="0"
           style="background-color:#fff3e0;border-left:4px solid #ff6f00;margin-bottom:20px;font-size:13px;">
        <tr>
            <td>
                <strong style="color:#e65100;">Shipping Address:</strong><br />
                <span style="color:#374151;">{{ $order->shipping_address }}</span>
            </td>
        </tr>
    </table>
    @endif

    @if($order->order_note)
    <table width="100%" cellpadding="12" cellspacing="0" border="0"
           style="background-color:#fff3e0;border-left:4px solid #ff6f00;margin-bottom:20px;font-size:13px;">
        <tr>
            <td>
                <strong style="color:#e65100;">Customer Note:</strong><br />
                <span style="color:#374151;">{{ $order->order_note }}</span>
            </td>
        </tr>
    </table>
    @endif

    <!-- Admin Action Button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        <tr>
            <td align="center">
                <a href="{{ config('app.url') }}/admin/orders/{{ $order->id }}" 
                   style="display:inline-block;padding:12px 32px;background-color:#ff6f00;color:#ffffff;
                          text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;">
                    View Order in Admin Panel
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#4a4a4a;line-height:1.7;">
        Please process this order as soon as possible. Log in to the admin panel to update the order status.
    </p>

</x-mail-layout>
