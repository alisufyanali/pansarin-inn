<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #3B82F6; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Verify Your Email</h2>
        <p>Thank you for subscribing to our newsletter!</p>
        <p>Please click the button below to verify your email address:</p>
        <p>
            <a href="{{ route('newsletter.verify', $newsletter->verification_token) }}" class="button">
                Verify Email
            </a>
        </p>
        <p>Or copy and paste this link:</p>
        <p>{{ route('newsletter.verify', $newsletter->verification_token) }}</p>
    </div>
</body>
</html>