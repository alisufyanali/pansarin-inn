<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'whatsapp' => [
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
        'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),
        'api_url' => env('WHATSAPP_API_URL', 'https://graph.facebook.com'),
    ],

    // ── Courier services ──────────────────────────────────────────
    'movex' => [
        'api_token' => env('MOVEX_API_TOKEN'),
    ],

    'postex' => [
        'api_token' => env('POSTEX_API_TOKEN'),
    ],

    'leopard' => [
        'api_key'          => env('LEOPARD_API_KEY'),
        'api_password'     => env('LEOPARD_API_PASSWORD'),
        'shipment_id'      => env('LEOPARD_SHIPMENT_ID'),
        'shipment_email'   => env('LEOPARD_SHIPMENT_EMAIL'),
        'shipment_phone'   => env('LEOPARD_SHIPMENT_PHONE'),
        'shipment_address' => env('LEOPARD_SHIPMENT_ADDRESS'),
        'return_address'   => env('LEOPARD_RETURN_ADDRESS'),
        'origin_city'      => env('LEOPARD_ORIGIN_CITY', 592),
        'return_city'      => env('LEOPARD_RETURN_CITY', 592),
    ],

];
