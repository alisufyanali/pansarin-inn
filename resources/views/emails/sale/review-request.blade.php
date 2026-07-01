<x-mail-layout
    title="Share Your Feedback — {{ $sale->sale_code }}"
    heading="How was your experience?"
    subheading="Order: {{ $sale->sale_code }}"
>

    <p style="margin:0 0 16px;font-size:14px;color:#1f2d1f;">
        Dear <strong>{{ $customer->first_name ?? 'Customer' }}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.7;">
        Thank you for shopping with <strong>Pansari Inn</strong>. We hope you loved your order.
        Your feedback helps us serve you better!
    </p>

    <!-- Stars -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
        <tr>
            <td align="center" style="font-size:32px;">⭐⭐⭐⭐⭐</td>
        </tr>
    </table>
    <p style="text-align:center;font-size:13px;color:#757575;margin:0 0 24px;">
        Tap a star to rate your experience
    </p>

    <!-- CTA button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        <tr>
            <td align="center">
                <a href="{{ url('/review/' . $sale->sale_code) }}"
                   style="display:inline-block;background-color:#2e7d32;color:#ffffff;text-decoration:none;
                          padding:13px 36px;border-radius:6px;font-size:14px;font-weight:700;
                          letter-spacing:0.5px;">
                    Leave a Review
                </a>
            </td>
        </tr>
    </table>

    <p style="font-size:12px;color:#9e9e9e;text-align:center;margin:0;">
        If you have any questions, reply to this email or contact us at
        <a href="mailto:pansariinn@gmail.com" style="color:#2e7d32;text-decoration:none;">pansariinn@gmail.com</a>
    </p>

</x-mail-layout>
