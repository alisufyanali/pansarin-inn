<?php

namespace App\Jobs;

use App\Models\Sale;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
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
    public function handle(WhatsAppService $whatsappService): void
    {
        try {
            // Load relationships
            $this->sale->load(['customer', 'items.product']);

            // Check if customer has phone
            if (!$this->sale->customer || !$this->sale->customer->phone) {
                Log::warning('No customer phone for sale WhatsApp', ['sale_id' => $this->sale->id]);
                return;
            }

            // Prepare message data
            $customerName = $this->sale->customer->full_name ?? $this->sale->customer->first_name;
            $saleCode = $this->sale->sale_code;
            $grandTotal = 'Rs. ' . number_format($this->sale->grand_total, 2);
            $deliveryAddress = $this->sale->shipping_address ?? 'N/A';

            $message = "Hello {$customerName},\n\nThank you for your purchase! 🌿\n\nYour purchase details:\nSale Code: {$saleCode}\nTotal: {$grandTotal}\nDelivery Address: {$deliveryAddress}\n\nWe appreciate your business!\n\nBest regards,\nPansari Inn Team";

            // Send WhatsApp message using custom text
            Log::info('WHATSAPP JOB START: send sale message', [
                'sale_id' => $this->sale->id,
                'phone' => $this->sale->customer->phone,
                'clean_phone' => preg_replace('/\D+/', '', $this->sale->customer->phone),
                'message' => $message,
            ]);

            $response = $whatsappService->sendTextMessage(
                $this->sale->customer->phone,
                $message
            );

            \App\Models\WhatsappMessageLog::create([
                'phone' => preg_replace('/\D+/', '', $this->sale->customer->phone),
                'customer_name' => $customerName,
                'order_id' => $saleCode,
                'order_total' => $this->sale->grand_total,
                'delivery_address' => $deliveryAddress,
                'messages' => $message,
                'api_response' => json_encode($response),
            ]);

            Log::info('WHATSAPP JOB RESPONSE: sale message sent', [
                'sale_id' => $this->sale->id,
                'response' => $response,
            ]);

        } catch (\Exception $e) {
            Log::warning('Failed to send sale WhatsApp', [
                'sale_id' => $this->sale->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
