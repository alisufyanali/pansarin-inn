<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ $emailSubject }}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(90deg, #1b4332, #2d6a4f); padding: 28px 40px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1px; }
        .header p { color: #95d5b2; margin: 6px 0 0; font-size: 12px; }
        .body { padding: 32px 40px; font-size: 14px; line-height: 1.7; color: #374151; }
        .footer { text-align: center; padding: 16px 24px; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
        .unsubscribe { color: #9ca3af; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 Pansari Inn</h1>
            <p>Newsletter</p>
        </div>
        <div class="body">
            @if($subscriberName)
                <p>Hi <strong>{{ $subscriberName }}</strong>,</p>
            @endif
            {!! nl2br(e($body)) !!}
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Pansari Inn. All rights reserved.<br />
            <a href="{{ url('/') }}" class="unsubscribe">Visit our store</a>
        </div>
    </div>
</body>
</html>
