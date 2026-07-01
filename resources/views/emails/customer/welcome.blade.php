<x-mail-layout
    title="Welcome to Pansari Inn!"
    heading="Welcome to Pansari Inn! 🌿"
    subheading="Your journey to pure wellness starts here."
>

    <p style="margin:0 0 16px;font-size:14px;color:#1f2d1f;">
        Dear <strong>{{ $customer->first_name }} {{ $customer->last_name }}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.7;">
        Thank you for registering an account with <strong>Pansari Inn</strong>.
        We are thrilled to welcome you to our family!
    </p>

    <!-- Account details card -->
    <table width="100%" cellpadding="10" cellspacing="0" border="0"
           style="background-color:#f1f8f1;border:1px solid #c8e6c8;border-left:4px solid #2e7d32;
                  border-radius:6px;margin-bottom:24px;">
        <tr>
            <td colspan="2" style="font-size:13px;font-weight:700;color:#1b5e20;padding-bottom:6px;
                                   border-bottom:1px solid #dcedc8;padding:10px 12px;">
                Your Account Details
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;padding:8px 12px;border-bottom:1px solid #e8f5e9;width:120px;">
                <strong>Name:</strong>
            </td>
            <td style="font-size:13px;color:#374151;padding:8px 12px;border-bottom:1px solid #e8f5e9;">
                {{ $customer->first_name }} {{ $customer->last_name }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;padding:8px 12px;border-bottom:1px solid #e8f5e9;">
                <strong>Email:</strong>
            </td>
            <td style="font-size:13px;color:#374151;padding:8px 12px;border-bottom:1px solid #e8f5e9;">
                {{ $customer->email }}
            </td>
        </tr>
        <tr>
            <td style="font-size:13px;color:#374151;padding:8px 12px;">
                <strong>Phone:</strong>
            </td>
            <td style="font-size:13px;color:#374151;padding:8px 12px;">
                {{ $customer->phone }}
            </td>
        </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
        You can now log in to your account, track your orders, manage your shipping addresses,
        and explore our wide range of products.
    </p>
    <p style="margin:0;font-size:13px;color:#4a4a4a;line-height:1.7;">
        If you have any questions or need assistance, feel free to reply to this email or contact us.
    </p>

</x-mail-layout>
