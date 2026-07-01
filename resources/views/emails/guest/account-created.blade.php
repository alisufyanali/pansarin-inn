<x-mail-layout
    title="Your Pansari Inn Account"
    heading="Order Confirmed &amp; Account Created"
    subheading="Welcome to Pansari Inn!"
>

    <p style="margin:0 0 16px;font-size:14px;color:#1f2d1f;">
        Hi <strong>{{ $customerName }}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
        Your order has been placed successfully!
    </p>

    <!-- Order badge -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
            <td align="center">
                <span style="display:inline-block;background-color:#e8f5e9;color:#1b5e20;
                             padding:6px 20px;border-radius:20px;font-size:13px;font-weight:700;
                             border:1px solid #a5d6a7;">
                    Order #{{ $orderNumber }}
                </span>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.7;">
        We have also created an account for you on <strong>Pansari Inn</strong>
        so you can track your orders anytime.
    </p>

    <!-- Credentials -->
    <table width="100%" cellpadding="10" cellspacing="0" border="0"
           style="background-color:#f1f8f1;border:1px solid #c8e6c8;border-radius:6px;margin-bottom:24px;">
        <tr>
            <td colspan="2" style="font-size:13px;font-weight:700;color:#1b5e20;
                                   border-bottom:1px solid #dcedc8;padding:10px 12px;">
                Your Login Credentials
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;padding:8px 12px;border-bottom:1px solid #e8f5e9;width:80px;">
                <strong>Email:</strong>
            </td>
            <td style="font-size:13px;padding:8px 12px;border-bottom:1px solid #e8f5e9;">
                <span style="font-family:monospace;background-color:#dcfce7;color:#166534;
                             padding:2px 8px;border-radius:4px;font-weight:600;">
                    {{ $customerEmail }}
                </span>
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;padding:8px 12px;">
                <strong>Password:</strong>
            </td>
            <td style="font-size:13px;padding:8px 12px;">
                <span style="font-family:monospace;background-color:#dcfce7;color:#166534;
                             padding:2px 8px;border-radius:4px;font-weight:600;">
                    {{ $customerPhone }}
                </span>
                <em style="font-size:12px;color:#757575;"> (your phone number)</em>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">
        You can use these credentials to log in and view your order history, track deliveries,
        and manage your account.
    </p>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        <tr>
            <td align="center">
                <a href="{{ url('/login') }}"
                   style="display:inline-block;background-color:#2e7d32;color:#ffffff;text-decoration:none;
                          padding:13px 36px;border-radius:6px;font-size:14px;font-weight:700;">
                    Login to Your Account
                </a>
            </td>
        </tr>
    </table>

    <p style="font-size:12px;color:#9e9e9e;text-align:center;margin:0;">
        If you did not place this order, please contact us immediately at
        <a href="mailto:pansariinn@gmail.com" style="color:#2e7d32;text-decoration:none;">pansariinn@gmail.com</a>
    </p>

</x-mail-layout>
