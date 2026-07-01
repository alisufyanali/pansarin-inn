<x-mail-layout
    title="{{ $emailSubject }}"
    heading="{{ $emailSubject }}"
    subheading="Pansari Inn Newsletter"
>

    @if($subscriberName)
    <p style="margin:0 0 16px;font-size:14px;color:#1f2d1f;">
        Hi <strong>{{ $subscriberName }}</strong>,
    </p>
    @endif

    <div style="font-size:14px;color:#374151;line-height:1.8;">
        {!! nl2br(e($body)) !!}
    </div>

    <p style="margin:24px 0 0;font-size:12px;color:#9e9e9e;text-align:center;">
        <a href="{{ url('/') }}" style="color:#2e7d32;text-decoration:none;">Visit our store</a>
    </p>

</x-mail-layout>
