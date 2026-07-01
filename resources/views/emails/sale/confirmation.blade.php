<x-mail-layout
    title="Purchase Confirmation — {{ $sale->sale_code }}"
    heading="Purchase Confirmation"
    subheading="Thank you for your purchase!"
>

    <p style="margin:0 0 16px;font-size:14px;color:#1f2d1f;">
        Dear <strong>{{ $sale->customer->first_name }} {{ $sale->customer->last_name }}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.7;">
        We're excited to confirm your purchase. Here are the details:
    </p>

    <!-- Sale meta -->
    <table width="100%" cellpadding="10" cellspacing="0" border="0"
           style="background-color:#f1f8f1;border:1px solid #c8e6c8;border-radius:6px;margin-bottom:24px;">
        <tr>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #dcedc8;">
                <strong style="color:#1b5e20;">Sale Code:</strong>
            </td>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #dcedc8;text-align:right;">
                {{ $sale->sale_code }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #dcedc8;">
                <strong style="color:#1b5e20;">Date:</strong>
            </td>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #dcedc8;text-align:right;">
                {{ $sale->created_at->format('d M, Y h:i A') }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #dcedc8;">
                <strong style="color:#1b5e20;">Payment Status:</strong>
            </td>
            <td style="font-size:13px;color:#374151;border-bottom:1px solid #dcedc8;text-align:right;">
                {{ ucfirst(str_replace('_', ' ', $sale->payment_status)) }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;">
                <strong style="color:#1b5e20;">Delivery Status:</strong>
            </td>
            <td style="font-size:13px;color:#374151;text-align:right;">
                {{ ucfirst($sale->delivery_status) }}
            </td>
        </tr>
    </table>

    <!-- Items table -->
    <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#1b5e20;">Items Purchased:</p>
    <table width="100%" cellpadding="10" cellspacing="0" border="0"
           style="border-collapse:collapse;margin-bottom:20px;font-size:13px;">
        <thead>
            <tr style="background-color:#2e7d32;">
                <th style="color:#ffffff;text-align:left;padding:10px 12px;">Product</th>
                <th style="color:#ffffff;text-align:center;padding:10px 12px;">Qty</th>
                <th style="color:#ffffff;text-align:right;padding:10px 12px;">Price</th>
                <th style="color:#ffffff;text-align:right;padding:10px 12px;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->items as $index => $item)
            <tr style="background-color:{{ $index % 2 === 0 ? '#f9fdf9' : '#ffffff' }};">
                <td style="padding:10px 12px;color:#374151;border-bottom:1px solid #e8f5e9;">
                    {{ $item->meta['product_name'] ?? ($item->product?->name ?? '—') }}
                    @if(isset($item->meta['variant_name']))
                        <br /><small style="color:#757575;">({{ $item->meta['variant_name'] }})</small>
                    @endif
                </td>
                <td style="padding:10px 12px;color:#374151;border-bottom:1px solid #e8f5e9;text-align:center;">
                    {{ $item->quantity }}
                </td>
                <td style="padding:10px 12px;color:#374151;border-bottom:1px solid #e8f5e9;text-align:right;">
                    PKR {{ number_format($item->price, 2) }}
                </td>
                <td style="padding:10px 12px;color:#374151;border-bottom:1px solid #e8f5e9;text-align:right;">
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
            <td style="text-align:right;color:#374151;width:130px;">PKR {{ number_format($sale->subtotal, 2) }}</td>
        </tr>
        @if($sale->product_discount > 0)
        <tr>
            <td style="text-align:right;color:#374151;"><strong>Product Discount:</strong></td>
            <td style="text-align:right;color:#c62828;">− PKR {{ number_format($sale->product_discount, 2) }}</td>
        </tr>
        @endif
        @if($sale->invoice_discount > 0)
        <tr>
            <td style="text-align:right;color:#374151;"><strong>Invoice Discount:</strong></td>
            <td style="text-align:right;color:#c62828;">− PKR {{ number_format($sale->invoice_discount, 2) }}</td>
        </tr>
        @endif
        @if($sale->shipping_charges > 0)
        <tr>
            <td style="text-align:right;color:#374151;"><strong>Shipping:</strong></td>
            <td style="text-align:right;color:#374151;">+ PKR {{ number_format($sale->shipping_charges, 2) }}</td>
        </tr>
        @endif
        @if($sale->vat > 0)
        <tr>
            <td style="text-align:right;color:#374151;"><strong>VAT:</strong></td>
            <td style="text-align:right;color:#374151;">+ PKR {{ number_format($sale->vat, 2) }}</td>
        </tr>
        @endif
        <tr style="background-color:#e8f5e9;">
            <td style="text-align:right;padding:10px 8px;font-size:15px;font-weight:700;color:#1b5e20;">
                <strong>Grand Total:</strong>
            </td>
            <td style="text-align:right;padding:10px 8px;font-size:15px;font-weight:700;color:#1b5e20;">
                PKR {{ number_format($sale->grand_total, 2) }}
            </td>
        </tr>
    </table>

    @if($sale->shipping_address)
    <table width="100%" cellpadding="12" cellspacing="0" border="0"
           style="background-color:#f1f8f1;border-left:4px solid #2e7d32;margin-bottom:20px;font-size:13px;">
        <tr>
            <td>
                <strong style="color:#1b5e20;">Shipping Address:</strong><br />
                <span style="color:#374151;">{{ $sale->shipping_address }}</span>
            </td>
        </tr>
    </table>
    @endif

    <p style="margin:0;font-size:13px;color:#4a4a4a;line-height:1.7;">
        If you have any questions, feel free to reach out to us.
    </p>

</x-mail-layout>
