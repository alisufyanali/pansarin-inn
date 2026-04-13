<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
        .card { background: #fff; border-radius: 10px; max-width: 560px; margin: 0 auto; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(90deg,#1b4332,#2d6a4f); padding: 28px 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .header p { color: #a7f3d0; margin: 6px 0 0; font-size: 13px; }
        .body { padding: 28px 32px; }
        .body p { color: #374151; font-size: 14px; line-height: 1.7; }
        .stars { text-align: center; font-size: 32px; margin: 20px 0 8px; }
        .btn { display: block; width: fit-content; margin: 20px auto; background: linear-gradient(90deg,#1b4332,#2d6a4f); color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; }
        .footer { text-align: center; padding: 16px; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>How was your experience?</h1>
            <p>Order: {{ $sale->sale_code }}</p>
        </div>
        <div class="body">
            <p>Dear <strong>{{ $customer->first_name ?? 'Customer' }}</strong>,</p>
            <p>Thank you for shopping with <strong>Pansari Inn</strong>. We hope you loved your order. Your feedback helps us serve you better!</p>
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <p style="text-align:center;color:#6b7280;font-size:13px;">Tap a star to rate your experience</p>
            <a href="{{ url('/review/' . $sale->sale_code) }}" class="btn">Leave a Review</a>
            <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:16px;">
                If you have any questions, reply to this email or contact us at pansariinn@gmail.com
            </p>
        </div>
        <div class="footer">© {{ date('Y') }} Pansari Inn — House of Herbs</div>
    </div>
</body>
</html>
