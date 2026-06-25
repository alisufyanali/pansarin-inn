<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Pansari Inn Account</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(90deg, #1b4332, #2d6a4f); padding: 30px 40px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; }
        .header p { color: #95d5b2; margin: 6px 0 0; font-size: 13px; }
        .body { padding: 32px 40px; }
        .body p { color: #374151; font-size: 14px; line-height: 1.7; }
        .credentials { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px 24px; margin: 20px 0; }
        .credentials p { margin: 6px 0; font-size: 14px; }
        .credentials strong { color: #1b4332; }
        .credentials .value { font-family: monospace; background: #dcfce7; padding: 2px 8px; border-radius: 4px; color: #166534; font-weight: 600; }
        .btn { display: block; width: fit-content; margin: 24px auto; background: linear-gradient(90deg, #1b4332, #2d6a4f); color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; }
        .order-badge { text-align: center; margin: 16px 0; }
        .order-badge span { background: #dcfce7; color: #166534; padding: 4px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; }
        .footer { text-align: center; padding: 16px; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 Pansari Inn</h1>
            <p>Order Confirmed &amp; Account Created</p>
        </div>
        <div class="body">
            <p>Hi <strong>{{ $customerName }}</strong>,</p>
            <p>Your order has been placed successfully!</p>

            <div class="order-badge">
                <span>Order #{{ $orderNumber }}</span>
            </div>

            <p>We have also created an account for you on <strong>Pansari Inn</strong> so you can track your orders anytime.</p>

            <div class="credentials">
                <p><strong>Your Login Credentials:</strong></p>
                <p>Email: <span class="value">{{ $customerEmail }}</span></p>
                <p>Password: <span class="value">{{ $customerPhone }}</span> <em style="font-size:12px;color:#6b7280;">(your phone number)</em></p>
            </div>

            <p>You can use these credentials to login and view your order history, track deliveries, and manage your account.</p>

            <a href="{{ url('/login') }}" class="btn">Login to Your Account</a>

            <p style="font-size:13px;color:#6b7280;">If you did not place this order, please contact us immediately at <a href="mailto:pansariinn@gmail.com">pansariinn@gmail.com</a></p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Pansari Inn. All rights reserved.
        </div>
    </div>
</body>
</html>
