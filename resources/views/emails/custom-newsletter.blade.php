<x-mail-layout
    title="{{ $emailSubject }}"
    heading="{{ $emailSubject }}"
    subheading="Pansari Inn Newsletter"
>

    <div style="font-size:14px;color:#374151;line-height:1.8;">
        {!! nl2br(e($body)) !!}
    </div>

    <p style="margin:24px 0 0;font-size:12px;color:#9e9e9e;text-align:center;">
        You are receiving this email because you subscribed to Pansari Inn newsletter.<br />
        <a href="{{ url('/api/newsletter/unsubscribe?email=' . urlencode($recipientEmail)) }}"
           style="color:#2e7d32;text-decoration:none;">Unsubscribe</a>
    </p>

</x-mail-layout>
