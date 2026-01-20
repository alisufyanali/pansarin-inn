<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Sale;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendSaleWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $sale;

    /**
     * Create a new job instance.
     */
    public function __construct(Sale $sale)
    {
        $this->sale = $sale;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Load relationships
            $this->sale->load(['customer', 'order', 'items.product']);

            // Check if customer has phone
            if (!$this->sale->customer || !$this->sale->customer->phone) {
                Log::info("Sale {$this->sale->sale_code}: Customer has no phone number");
                return;
            }

            // Format phone number (remove spaces, dashes, etc.)
            $phone = preg_replace('/[^0-9]/', '', $this->sale->customer->phone);
            
            // Add country code if not present (assuming Pakistan +92)
            if (!str_starts_with($phone, '92')) {
                $phone = '92' . ltrim($phone, '0');
            }

            // Prepare message
            $message = $this->prepareMessage();

            // Send WhatsApp message
            $this->sendWhatsAppMessage($phone, $message);

            Log::info("Sale WhatsApp notification sent for sale: {$this->sale->sale_code}");

        } catch (\Exception $e) {
            Log::error("Failed to send sale WhatsApp notification for sale {$this->sale->sale_code}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Prepare WhatsApp message
     */
    private function prepareMessage(): string
    {
        $customerName = $this->sale->customer->first_name . ' ' . $this->sale->customer->last_name;
        $saleCode = $this->sale->sale_code;
        $orderNumber = $this->sale->order->order_number ?? 'N/A';
        $grandTotal = number_format($this->sale->grand_total, 2);
        $deliveryStatus = ucfirst($this->sale->delivery_status);
        $paymentStatus = ucfirst(str_replace('_', ' ', $this->sale->payment_status));

        // Build items list
        $itemsList = '';
        foreach ($this->sale->items as $index => $item) {
            $num = $index + 1;
            $productName = $item->meta['product_name'] ?? $item->product->name ?? 'Product';
            $variantName = $item->meta['variant_name'] ?? '';
            $qty = $item->quantity;
            $price = number_format($item->subtotal, 2);
            
            $itemsList .= "\n{$num}. {$productName}";
            if ($variantName) {
                $itemsList .= " ({$variantName})";
            }
            $itemsList .= "\n   Qty: {$qty} | PKR {$price}";
        }

        $message = "🎉 *Sale Confirmed!*\n\n";
        $message .= "Dear *{$customerName}*,\n\n";
        $message .= "Your sale has been confirmed.\n\n";
        $message .= "📋 *Sale Details:*\n";
        $message .= "━━━━━━━━━━━━━━━━\n";
        $message .= "Sale Code: *{$saleCode}*\n";
        $message .= "Order Number: *{$orderNumber}*\n";
        $message .= "Delivery Status: *{$deliveryStatus}*\n";
        $message .= "Payment Status: *{$paymentStatus}*\n\n";
        $message .= "📦 *Items:*{$itemsList}\n\n";
        $message .= "━━━━━━━━━━━━━━━━\n";
        $message .= "💰 *Grand Total: PKR {$grandTotal}*\n\n";

        if ($this->sale->shipping_address) {
            $message .= "📍 *Shipping Address:*\n";
            $message .= $this->sale->shipping_address . "\n\n";
        }

        if ($this->sale->shipping_method) {
            $message .= "🚚 *Shipping Method:* " . ucfirst($this->sale->shipping_method) . "\n\n";
        }

        $message .= "Thank you for your business! 🙏\n\n";
        $message .= "For any queries, please contact us.\n";
        $message .= "━━━━━━━━━━━━━━━━";

        return $message;
    }

    /**
     * Send WhatsApp message via API
     */
    private function sendWhatsAppMessage(string $phone, string $message): void
    {
        // Option 1: Using WhatsApp Business API (if you have access)
        // Uncomment and configure this if you have WhatsApp Business API
        /*
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.whatsapp.token'),
            'Content-Type' => 'application/json',
        ])->post(config('services.whatsapp.api_url'), [
            'messaging_product' => 'whatsapp',
            'to' => $phone,
            'type' => 'text',
            'text' => [
                'body' => $message
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception('WhatsApp API Error: ' . $response->body());
        }
        */

        // Option 2: Using a third-party service like Twilio
        // Uncomment and configure if using Twilio
        /*
        $response = Http::asForm()->post('https://api.twilio.com/2010-04-01/Accounts/' . config('services.twilio.sid') . '/Messages.json', [
            'From' => 'whatsapp:' . config('services.twilio.whatsapp_number'),
            'To' => 'whatsapp:+' . $phone,
            'Body' => $message,
        ])->withBasicAuth(config('services.twilio.sid'), config('services.twilio.token'));

        if (!$response->successful()) {
            throw new \Exception('Twilio WhatsApp Error: ' . $response->body());
        }
        */

        // Option 3: Using WhatAPI or similar services
        // Replace with your actual WhatsApp API endpoint
        $apiUrl = config('services.whatsapp.api_url', 'https://your-whatsapp-api.com/send');
        $apiToken = config('services.whatsapp.token', 'your-api-token');

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiToken,
        ])->post($apiUrl, [
            'phone' => $phone,
            'message' => $message,
        ]);

        if (!$response->successful()) {
            Log::warning("WhatsApp API returned error: " . $response->body());
            // Don't throw exception to prevent job failure
            // throw new \Exception('WhatsApp API Error: ' . $response->body());
        }

        Log::info("WhatsApp message sent to: {$phone}");
    }
}