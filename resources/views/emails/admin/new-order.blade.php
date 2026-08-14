<x-mail-layout
    title="New Order — {{ $order->order_number }}"
    heading="🔔 New Order Received"
    subheading="A new order has been placed on your store"
>

{{--
    ════════════════════════════════════════════════════════════════
    ADMIN NEW ORDER NOTIFICATION — Shopify-style invoice layout
    ─ All styles are inline (required for email client compatibility)
    ─ Table-based layout only (no flex/grid — Outlook incompatible)
    ─ Brand palette: greens (#1b5e20 / #2e7d32 / #e8f5e9 / #c8e6c9)
    ─ Max content width: 536px (600px outer − 32px padding × 2)
    ════════════════════════════════════════════════════════════════
--}}

{{-- ── 1. ALERT BANNER ──────────────────────────────────────────── --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        <td style="background-color:#e8f5e9;border:1px solid #a5d6a7;border-radius:6px;
                   padding:12px 16px;font-size:13px;color:#1b5e20;">
            <strong>⚡ Action Required:</strong> A new order has been placed and is waiting for processing.
        </td>
    </tr>
</table>

{{-- ── 2. ORDER META + BILL-TO  (2-column on desktop, stacks on mobile) ── --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        {{-- Left: Order Details --}}
        <td width="50%" valign="top" style="padding-right:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid #c8e6c9;border-radius:6px;overflow:hidden;font-size:13px;">
                <tr>
                    <td style="background-color:#2e7d32;padding:8px 12px;">
                        <strong style="color:#ffffff;font-size:12px;text-transform:uppercase;
                                       letter-spacing:0.5px;">Order Details</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0;">
                        <table width="100%" cellpadding="8" cellspacing="0" border="0">
                            <tr>
                                <td style="font-size:12px;color:#555555;width:45%;
                                           border-bottom:1px solid #e8f5e9;">Order #</td>
                                <td style="font-size:13px;color:#1b5e20;font-weight:700;
                                           border-bottom:1px solid #e8f5e9;text-align:right;">
                                    {{ $order->order_number }}
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:12px;color:#555555;
                                           border-bottom:1px solid #e8f5e9;">Date</td>
                                <td style="font-size:12px;color:#374151;
                                           border-bottom:1px solid #e8f5e9;text-align:right;">
                                    {{ $order->created_at->format('d M Y, h:i A') }}
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:12px;color:#555555;
                                           border-bottom:1px solid #e8f5e9;">Order Status</td>
                                <td style="font-size:12px;color:#374151;
                                           border-bottom:1px solid #e8f5e9;text-align:right;">
                                    {{ ucfirst($order->status) }}
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:12px;color:#555555;">Payment</td>
                                <td style="font-size:12px;text-align:right;
                                           color:{{ $order->payment_status === 'paid' ? '#2e7d32' : '#c62828' }};">
                                    {{ ucfirst(str_replace('_', ' ', $order->payment_status)) }}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>

        {{-- Right: Bill To --}}
        <td width="50%" valign="top" style="padding-left:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid #c8e6c9;border-radius:6px;overflow:hidden;font-size:13px;">
                <tr>
                    <td style="background-color:#2e7d32;padding:8px 12px;">
                        <strong style="color:#ffffff;font-size:12px;text-transform:uppercase;
                                       letter-spacing:0.5px;">Bill To</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 12px;">
                        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1b5e20;">
                            {{ $customer->first_name }} {{ $customer->last_name }}
                        </p>
                        @if($customer->email)
                        <p style="margin:0 0 4px;font-size:12px;color:#555555;">
                            ✉ {{ $customer->email }}
                        </p>
                        @endif
                        <p style="margin:0 0 4px;font-size:12px;color:#555555;">
                            📞 {{ $customer->phone }}
                        </p>
                        @if($order->shipping_address)
                        <p style="margin:6px 0 0;font-size:12px;color:#374151;line-height:1.5;
                                  border-top:1px solid #e8f5e9;padding-top:6px;">
                            📍 {{ $order->shipping_address }}
                        </p>
                        @endif
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

{{-- ── 3. ORDER ITEMS TABLE ─────────────────────────────────────── --}}
<p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1b5e20;
           text-transform:uppercase;letter-spacing:0.5px;">Order Items</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0"
       style="border-collapse:collapse;border:1px solid #c8e6c9;
              border-radius:6px;overflow:hidden;margin-bottom:20px;font-size:13px;">
    {{-- Header row --}}
    <tr style="background-color:#2e7d32;">
        <th align="left"   style="color:#ffffff;padding:9px 12px;font-size:12px;
                                  font-weight:700;text-transform:uppercase;letter-spacing:0.3px;
                                  border:none;">Product</th>
        <th align="center" style="color:#ffffff;padding:9px 12px;font-size:12px;
                                  font-weight:700;text-transform:uppercase;letter-spacing:0.3px;
                                  width:40px;border:none;">Qty</th>
        <th align="right"  style="color:#ffffff;padding:9px 12px;font-size:12px;
                                  font-weight:700;text-transform:uppercase;letter-spacing:0.3px;
                                  width:90px;border:none;">Price</th>
        <th align="right"  style="color:#ffffff;padding:9px 12px;font-size:12px;
                                  font-weight:700;text-transform:uppercase;letter-spacing:0.3px;
                                  width:90px;border:none;">Total</th>
    </tr>

    @foreach($items as $index => $item)
    <tr style="background-color:{{ $index % 2 === 0 ? '#f1f8e9' : '#ffffff' }};">
        {{-- Product name + variant --}}
        <td style="padding:10px 12px;color:#1f2d1f;
                   border-bottom:1px solid #e8f5e9;vertical-align:top;">
            <span style="font-weight:600;">
                {{ $item->meta['product_name'] ?? ($item->product->name ?? '—') }}
            </span>
            @if(!empty($item->meta['variant_name']))
            <br /><span style="font-size:11px;color:#777777;">
                Variant: {{ $item->meta['variant_name'] }}
            </span>
            @endif
            @if(!empty($item->meta['sku']))
            <br /><span style="font-size:11px;color:#aaaaaa;">
                SKU: {{ $item->meta['sku'] }}
            </span>
            @endif
        </td>
        {{-- Qty --}}
        <td align="center"
            style="padding:10px 12px;color:#374151;
                   border-bottom:1px solid #e8f5e9;vertical-align:middle;
                   font-weight:600;">
            {{ $item->quantity }}
        </td>
        {{-- Unit price --}}
        <td align="right"
            style="padding:10px 12px;color:#374151;
                   border-bottom:1px solid #e8f5e9;vertical-align:middle;
                   white-space:nowrap;">
            PKR {{ number_format($item->price, 2) }}
        </td>
        {{-- Line subtotal --}}
        <td align="right"
            style="padding:10px 12px;color:#1b5e20;font-weight:700;
                   border-bottom:1px solid #e8f5e9;vertical-align:middle;
                   white-space:nowrap;">
            PKR {{ number_format($item->subtotal, 2) }}
        </td>
    </tr>
    @endforeach
</table>

{{-- ── 4. TOTALS SUMMARY ───────────────────────────────────────── --}}
{{--
    Right-aligned summary box. Uses a wrapper table to push the inner
    summary table to the right without flex/float (Outlook-safe).
--}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        {{-- Empty left spacer (≈50% width) --}}
        <td width="50%">&nbsp;</td>
        {{-- Summary box occupies right half --}}
        <td width="50%" valign="top">
            <table width="100%" cellpadding="8" cellspacing="0" border="0"
                   style="border:1px solid #c8e6c9;border-radius:6px;
                          overflow:hidden;font-size:13px;">
                <tr>
                    <td colspan="2" style="background-color:#2e7d32;padding:7px 12px;">
                        <strong style="color:#ffffff;font-size:12px;text-transform:uppercase;
                                       letter-spacing:0.5px;">Summary</strong>
                    </td>
                </tr>

                <tr>
                    <td style="color:#555555;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;">Subtotal</td>
                    <td align="right"
                        style="color:#374151;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;white-space:nowrap;">
                        PKR {{ number_format($order->subtotal, 2) }}
                    </td>
                </tr>

                @if($order->product_discount > 0)
                <tr>
                    <td style="color:#555555;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;">Product Discount</td>
                    <td align="right"
                        style="color:#c62828;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;white-space:nowrap;">
                        − PKR {{ number_format($order->product_discount, 2) }}
                    </td>
                </tr>
                @endif

                @if($order->invoice_discount > 0)
                <tr>
                    <td style="color:#555555;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;">Invoice Discount</td>
                    <td align="right"
                        style="color:#c62828;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;white-space:nowrap;">
                        − PKR {{ number_format($order->invoice_discount, 2) }}
                    </td>
                </tr>
                @endif

                @if($order->shipping_charges > 0)
                <tr>
                    <td style="color:#555555;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;">Shipping</td>
                    <td align="right"
                        style="color:#374151;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;white-space:nowrap;">
                        + PKR {{ number_format($order->shipping_charges, 2) }}
                    </td>
                </tr>
                @endif

                @if($order->tax > 0)
                <tr>
                    <td style="color:#555555;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;">Tax</td>
                    <td align="right"
                        style="color:#374151;border-bottom:1px solid #e8f5e9;
                               padding:7px 12px;white-space:nowrap;">
                        + PKR {{ number_format($order->tax, 2) }}
                    </td>
                </tr>
                @endif

                {{-- Grand total row --}}
                <tr style="background-color:#e8f5e9;">
                    <td style="padding:10px 12px;font-size:14px;font-weight:700;
                               color:#1b5e20;">Grand Total</td>
                    <td align="right"
                        style="padding:10px 12px;font-size:14px;font-weight:700;
                               color:#1b5e20;white-space:nowrap;">
                        PKR {{ number_format($order->grand_total, 2) }}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

{{-- ── 5. ORDER NOTE (conditional) ─────────────────────────────── --}}
@if($order->order_note)
<table width="100%" cellpadding="12" cellspacing="0" border="0"
       style="border-left:4px solid #2e7d32;background-color:#f1f8e9;
              margin-bottom:20px;font-size:13px;border-radius:0 4px 4px 0;">
    <tr>
        <td>
            <strong style="color:#1b5e20;display:block;margin-bottom:4px;">
                Customer Note:
            </strong>
            <span style="color:#374151;line-height:1.6;">
                {{ $order->order_note }}
            </span>
        </td>
    </tr>
</table>
@endif

{{-- ── 6. CTA BUTTON ───────────────────────────────────────────── --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr>
        <td align="center">
            <a href="{{ config('app.url') }}/admin/orders/{{ $order->id }}"
               style="display:inline-block;padding:13px 36px;
                      background-color:#2e7d32;color:#ffffff;
                      text-decoration:none;border-radius:6px;
                      font-weight:700;font-size:14px;letter-spacing:0.3px;">
                View &amp; Process Order →
            </a>
        </td>
    </tr>
</table>

<p style="margin:0;font-size:12px;color:#888888;text-align:center;line-height:1.6;">
    Log in to the admin panel to update the order status, assign courier, and mark payment.
</p>

</x-mail-layout>
