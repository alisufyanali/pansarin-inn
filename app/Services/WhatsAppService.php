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

    public function __construct()
    {
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
        $this->accessToken = config('services.whatsapp.access_token');
    }

    /**
     * Send template message (for orders)
     */
    public function sendTemplateMessage(
        string $recipientPhone,
        string $customerName,
        string $orderId,
        string $orderTotal,
        string $deliveryAddress,
        string $templateName = 'order_confirmation'
    ) {
        $url = "https://graph.facebook.com/v22.0/{$this->phoneNumberId}/messages";

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
                            ['type' => 'text', 'text' => $orderTotal],
                            ['type' => 'text', 'text' => $deliveryAddress],
                        ],
                    ],
                ],
            ],
        ];

        try {
            $response = Http::withToken($this->accessToken)
                ->post($url, $data);

            $responseData = $response->json();

            // Save to log
            $this->saveMessageLog(
                $recipientPhone,
                $customerName,
                $orderId,
                $orderTotal,
                $deliveryAddress,
                "Order: $orderId - Total: $orderTotal",
                $response->body()
            );

            // Check for errors
            if (isset($responseData['error'])) {
                $this->sendErrorEmail($responseData);
            }

            return $responseData;
        } catch (\Exception $e) {
            Log::error('WhatsApp Template Message Error', [
                'error' => $e->getMessage(),
                'phone' => $recipientPhone,
            ]);
            throw $e;
        }
    }

    /**
     * Send custom text message
     */
    public function sendTextMessage(string $recipientPhone, string $message)
    {
        $url = "https://graph.facebook.com/v19.0/{$this->phoneNumberId}/messages";

        $data = [
            'messaging_product' => 'whatsapp',
            'to' => $this->cleanPhone($recipientPhone),
            'type' => 'text',
            'text' => [
                'body' => $message,
            ],
        ];

        try {
            $response = Http::withToken($this->accessToken)
                ->post($url, $data);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('WhatsApp Text Message Error', [
                'error' => $e->getMessage(),
                'phone' => $recipientPhone,
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
        string $orderTotal,
        string $deliveryAddress,
        string $message,
        string $apiResponse
    ) {
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => $customerName,
            'order_id' => $orderId,
            'order_total' => $orderTotal,
            'delivery_address' => $deliveryAddress,
            'messages' => $message,
            'api_response' => $apiResponse,
        ]);
    }

    /**
     * Send error notification email
     */
    protected function sendErrorEmail(array $errorData)
    {
        $errorMessage = $errorData['error']['message'] ?? 'Unknown error';
        $errorCode = $errorData['error']['code'] ?? 'N/A';

        try {
            Mail::raw(
                "WhatsApp API Error:\nMessage: {$errorMessage}\nCode: {$errorCode}\n\nFull Response:\n".json_encode($errorData, JSON_PRETTY_PRINT),
                function ($message) use ($errorCode) {
                    $message->to(config('mail.admin_email', 'alisufyan2410@gmail.com'))
                        ->subject("WhatsApp API Error - Code {$errorCode}");
                }
            );
        } catch (\Exception $e) {
            Log::error('Failed to send error email', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Clean phone number
     */
    protected function cleanPhone(string $phone): string
    {
        return preg_replace('/\D+/', '', $phone);
    }
}
