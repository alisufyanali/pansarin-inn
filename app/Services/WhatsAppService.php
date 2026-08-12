<?php

// app/Services/WhatsAppService.php

namespace App\Services;

use App\Models\WhatsappMessageLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class WhatsAppService
{
    protected $phoneNumberId;

    protected $accessToken;
    protected $apiUrl;

    public function __construct()
    {
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
        $this->accessToken = config('services.whatsapp.access_token');
        $this->apiUrl = rtrim(config('services.whatsapp.api_url', 'https://graph.facebook.com'), '/');

        if (! $this->phoneNumberId || ! $this->accessToken) {
            Log::warning('WhatsAppService configuration missing', [
                'phone_number_id' => $this->phoneNumberId,
                'access_token_present' => ! empty($this->accessToken),
            ]);
        }
    }

    /**
     * Send template message (for orders)
     *
     * @param float  $orderTotal          Raw numeric total — stored in DB log (decimal column).
     * @param string $orderTotalFormatted Display string e.g. "Rs. 1,150.00" — sent in WhatsApp template.
     *                                    Falls back to formatting $orderTotal when omitted.
     */
    public function sendTemplateMessage(
        string $recipientPhone,
        string $customerName,
        string $orderId,
        float  $orderTotal,
        string $orderTotalFormatted = '',
        string $deliveryAddress = '',
        string $templateName = 'order_confirmation'
    ) {
        // Formatted display string for the WhatsApp template body
        $displayTotal = $orderTotalFormatted !== '' ? $orderTotalFormatted : 'Rs. ' . number_format($orderTotal, 2);

        $url = "{$this->apiUrl}/v22.0/{$this->phoneNumberId}/messages";

        $data = [
            'messaging_product' => 'whatsapp',
            'to' => $this->cleanPhone($recipientPhone),
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => 'en'],
                'components' => [
                    [
                        'type' => 'body',
                        'parameters' => [
                            ['type' => 'text', 'text' => $customerName],
                            ['type' => 'text', 'text' => $orderId],
                            ['type' => 'text', 'text' => $displayTotal],   // formatted for display
                            ['type' => 'text', 'text' => $deliveryAddress],
                        ],
                    ],
                ],
            ],
        ];

        try {
            $maskedToken = $this->maskToken($this->accessToken);

            Log::info('WHATSAPP SEND START (template)', [
                'template'            => $templateName,
                'api_url'             => $url,
                'access_token_masked' => $maskedToken,
            ]);

            $response = Http::withToken($this->accessToken)
                ->timeout(15)
                ->post($url, $data);

            $status = $response->status();
            $body = $response->body();
            $responseData = $response->json();

            // Save to log table — pass raw numeric total for the decimal DB column
            $this->saveMessageLog(
                $recipientPhone,
                $customerName,
                $orderId,
                $orderTotal,                        // float → decimal column ✓
                $deliveryAddress,
                "Order: $orderId - Total: $displayTotal",
                $body
            );

            Log::info('WHATSAPP SEND RESPONSE (template)', [
                'phone_tail' => '****' . substr(preg_replace('/\D/', '', $recipientPhone), -4),
                'status'     => $status,
            ]);

            // Check for errors
            if (isset($responseData['error'])) {
                $this->sendErrorEmail($responseData);
            }

            return $responseData;
        } catch (\Exception $e) {
            Log::error('WHATSAPP EXCEPTION (template)', [
                'order_id' => $orderId ?? null,
                'template' => $templateName,
                'message'  => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Send custom text message
     */
    public function sendTextMessage(string $recipientPhone, string $message)
    {
        $url = "{$this->apiUrl}/v19.0/{$this->phoneNumberId}/messages";

        $data = [
            'messaging_product' => 'whatsapp',
            'to' => $this->cleanPhone($recipientPhone),
            'type' => 'text',
            'text' => [
                'body' => $message,
            ],
        ];

        try {
            $maskedToken = $this->maskToken($this->accessToken);

            Log::info('WHATSAPP SEND START (text)', [
                'api_url'             => $url,
                'access_token_masked' => $maskedToken,
            ]);

            $response = Http::withToken($this->accessToken)
                ->timeout(15)
                ->post($url, $data);

            $status = $response->status();
            $body = $response->body();
            $responseData = $response->json();

            Log::info('WHATSAPP SEND RESPONSE (text)', [
                'phone_tail' => '****' . substr(preg_replace('/\D/', '', $recipientPhone), -4),
                'status'     => $status,
            ]);

            return $responseData;
        } catch (\Exception $e) {
            Log::error('WHATSAPP EXCEPTION (text)', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Save message log
     */
    protected function saveMessageLog(
        string $phone,
        string $customerName,
        string $orderId,
        float  $orderTotal,         // numeric — matches decimal(10,2) DB column
        string $deliveryAddress,
        string $message,
        string $apiResponse
    ) {
        WhatsappMessageLog::create([
            'phone' => preg_replace('/\D+/', '', $phone),
            'customer_name' => $customerName,
            'order_id' => $orderId,
            'order_total' => $orderTotal,
            'delivery_address' => $deliveryAddress,
            'messages' => $message,
            'api_response' => $apiResponse,
        ]);
    }

    /**
     * Mask sensitive token for logs
     */
    protected function maskToken(?string $token): ?string
    {
        if (! $token) return null;
        $len = strlen($token);
        if ($len <= 10) return substr($token, 0, 3) . '***';
        return substr($token, 0, 6) . '***' . substr($token, -4);
    }

    /**
     * Send error notification email
     */
    protected function sendErrorEmail(array $errorData)
    {
        $adminEmail = config('mail.admin_email');

        if (! $adminEmail) {
            Log::warning('WhatsApp error email skipped — ADMIN_EMAIL is not configured.', [
                'whatsapp_error' => $errorData['error']['message'] ?? 'unknown',
            ]);

            return;
        }

        $errorMessage = $errorData['error']['message'] ?? 'Unknown error';
        $errorCode = $errorData['error']['code'] ?? 'N/A';

        try {
            Mail::raw(
                "WhatsApp API Error:\nMessage: {$errorMessage}\nCode: {$errorCode}\n\nFull Response:\n".json_encode($errorData, JSON_PRETTY_PRINT),
                function ($message) use ($adminEmail, $errorCode) {
                    $message->to($adminEmail)
                        ->subject("WhatsApp API Error - Code {$errorCode}");
                }
            );
        } catch (\Exception $e) {
            Log::error('Failed to send error email', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Clean phone number to E.164 format (without leading +)
     * e.g. 03172159160 → 923172159160
     */
    protected function cleanPhone(string $phone): string
    {
        $clean = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($clean, '0')) {
            $clean = '92' . substr($clean, 1);
        }
        return $clean;
    }
}
