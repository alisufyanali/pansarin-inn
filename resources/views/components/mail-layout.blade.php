@props([
    'title'         => 'Pansari Inn',
    'heading'       => null,
    'subheading'    => null,
    'headerTagline' => 'House of Herbs &amp; Spices',
])
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>{{ $title }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f2f7f2;font-family:Arial,Helvetica,sans-serif;color:#1f2d1f;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f7f2;padding:32px 0;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0"
                       style="max-width:600px;width:100%;background-color:#ffffff;
                              border-radius:10px;overflow:hidden;border:1px solid #c8e6c8;">

                    {{-- ── HEADER ── --}}
                    <tr>
                        <td style="background-color:#1b5e20;padding:24px 32px;text-align:center;">
                            <a href="{{ config('app.frontend_url', config('app.url')) }}"
                               style="text-decoration:none;display:inline-block;">
                                {{-- Logo image — absolute URL so email clients can fetch it --}}
                                <img
                                    src="{{ rtrim(config('app.url'), '/') }}/logo.png"
                                    alt="Pansari Inn"
                                    width="160"
                                    height="auto"
                                    style="display:block;height:60px;width:auto;max-width:200px;object-fit:contain;margin:0 auto 8px;"
                                />
                                <p style="margin:0;font-size:13px;color:#a5d6a7;
                                          letter-spacing:1px;text-transform:uppercase;">
                                    {!! $headerTagline !!}
                                </p>
                            </a>
                        </td>
                    </tr>

                    {{-- ── TITLE BAR ── --}}
                    @if($heading)
                    <tr>
                        <td style="background-color:#2e7d32;padding:18px 32px;text-align:center;">
                            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">
                                {!! $heading !!}
                            </p>
                            @if($subheading)
                            <p style="margin:6px 0 0;font-size:13px;color:#c8e6c9;">
                                {!! $subheading !!}
                            </p>
                            @endif
                        </td>
                    </tr>
                    @endif

                    {{-- ── BODY ── --}}
                    <tr>
                        <td style="padding:32px;background-color:#ffffff;">
                            {{ $slot }}
                        </td>
                    </tr>

                    {{-- ── FOOTER ── --}}
                    <tr>
                        <td style="background-color:#e8f5e9;border-top:2px solid #a5d6a7;
                                   padding:20px 32px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:13px;color:#2e7d32;font-weight:700;">
                                Pansari Inn — House of Herbs &amp; Spices
                            </p>
                            <p style="margin:0 0 4px;font-size:12px;color:#4a4a4a;">
                                📧 <a href="mailto:pansariinn@gmail.com"
                                      style="color:#2e7d32;text-decoration:none;">
                                    pansariinn@gmail.com
                                </a>
                            </p>
                            <p style="margin:0 0 4px;font-size:12px;color:#4a4a4a;">
                                📞 <a href="tel:{{ config('services.contact.phone', '+92 304 5779900') }}"
                                      style="color:#2e7d32;text-decoration:none;">
                                    {{ config('services.contact.phone', '+92 304 5779900') }}
                                </a>
                            </p>
                            <p style="margin:0 0 4px;font-size:12px;color:#4a4a4a;">
                                💬 <a href="https://wa.me/{{ str_replace(['+', ' ', '-'], '', config('services.whatsapp.phone', '923045779900')) }}"
                                      style="color:#2e7d32;text-decoration:none;">
                                    WhatsApp: {{ config('services.whatsapp.phone', '+92 304 5779900') }}
                                </a>
                            </p>
                            <p style="margin:8px 0 0;font-size:11px;color:#9e9e9e;">
                                &copy; {{ date('Y') }} Pansari Inn. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
