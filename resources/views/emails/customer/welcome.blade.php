<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Pansari Inn</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 0 0 10px 10px;
        }
        .details {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border-left: 4px solid #10b981;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.85em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to Pansari Inn! 🌿</h1>
        <p>Your journey to pure wellness starts here.</p>
    </div>

    <div class="content">
        <p>Dear {{ $customer->first_name }} {{ $customer->last_name }},</p>
        
        <p>Thank you for registering an account with Pansari Inn. We are thrilled to welcome you to our family!</p>

        <div class="details">
            <p><strong>Your Account Details:</strong></p>
            <p><strong>Name:</strong> {{ $customer->first_name }} {{ $customer->last_name }}</p>
            <p><strong>Email:</strong> {{ $customer->email }}</p>
            <p><strong>Phone:</strong> {{ $customer->phone }}</p>
        </div>

        <p>You can now log in to your account, track your orders, manage your shipping addresses, and explore our wide range of products.</p>

        <p>If you have any questions or need assistance, feel free to reply to this email or contact us.</p>
    </div>

    <div class="footer">
        <p>Best regards,<br>The Pansari Inn Team</p>
        <p>&copy; {{ date('Y') }} Pansari Inn. All rights reserved.</p>
    </div>
</body>
</html>
