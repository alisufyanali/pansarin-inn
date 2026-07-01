<x-mail-layout
    title="Welcome to Pansari Inn Newsletter!"
    heading="You're Subscribed! 🎉"
    subheading="Pansari Inn Newsletter"
>

    @if(!empty($subscriberName))
    <p style="margin:0 0 16px;font-size:14px;color:#1f2d1f;">
        Hi <strong>{{ $subscriberName }}</strong>,
    </p>
    @endif

    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
        Thank you for subscribing to the <strong>Pansari Inn</strong> newsletter.
        You'll be the first to know about new products, special offers, and updates straight from our store.
    </p>

    <table width="100%" cellpadding="12" cellspacing="0" border="0"
           style="background-color:#f1f8f1;border-left:4px solid #2e7d32;border-radius:4px;margin-bottom:24px;">
        <tr>
            <td style="font-size:13px;color:#374151;line-height:1.7;">
                🌿 &nbsp;Fresh herbs &amp; spices<br />
                🏷️ &nbsp;Exclusive deals &amp; discounts<br />
                📦 &nbsp;New arrivals &amp; restocks
            </td>
        </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#9e9e9e;line-height:1.6;">
        If you did not subscribe to this newsletter, you can safely ignore this email.
    </p>

</x-mail-layout>
