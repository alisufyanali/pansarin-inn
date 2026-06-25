<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: #197B33; color: #fff; padding: 24px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; }
        .header p { margin: 4px 0 0; font-size: 12px; color: #b7f5c8; }
        .content { padding: 30px 32px; font-size: 14px; line-height: 1.7; color: #374151; }
        .footer { text-align: center; padding: 20px 24px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
        .unsubscribe { color: #9ca3af; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 Pansari Inn</h1>
            <p>Newsletter</p>
        </div>
        <div class="content">
            {!! nl2br(e($body)) !!}
        </div>
        <div class="footer">
            <p>You are receiving this email because you subscribed to Pansari Inn newsletter.</p>
            <a class="unsubscribe" href="{{ url('/api/newsletter/unsubscribe?email=' . urlencode($recipientEmail)) }}">
                Unsubscribe
            </a>
        </div>
    </div>
</body>
</html>
