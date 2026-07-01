<x-mail-layout
    title="Verify Your Email"
    heading="Verify Your Email Address"
    subheading="One quick step to complete your subscription"
>

    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
        Thank you for subscribing to the <strong>Pansari Inn</strong> newsletter!
        Please confirm your email address by clicking the button below.
    </p>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        <tr>
            <td align="center">
                <a href="{{ route('newsletter.verify', $newsletter->verification_token) }}"
                   style="display:inline-block;background-color:#2e7d32;color:#ffffff;text-decoration:none;
                          padding:13px 36px;border-radius:6px;font-size:14px;font-weight:700;">
                    Verify My Email
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#757575;line-height:1.7;">
        Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 20px;font-size:12px;word-break:break-all;">
        <a href="{{ route('newsletter.verify', $newsletter->verification_token) }}"
           style="color:#2e7d32;text-decoration:none;">
            {{ route('newsletter.verify', $newsletter->verification_token) }}
        </a>
    </p>

    <p style="margin:0;font-size:12px;color:#9e9e9e;line-height:1.6;">
        If you did not subscribe, you can safely ignore this email.
    </p>

</x-mail-layout>
