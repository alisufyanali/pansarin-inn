<?php

// app/Jobs/SendOrderWhatsAppNotification.php

namespace App\Jobs;

use App\Models\Order;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendOrderWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 30;
    public int $backoff = 60;

    public $order;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $whatsappService): void
    {
        try {
            // Load relationships
            $this->order->load(['customer', 'items.product']);

            // Check if customer has phone
            if (! $this->order->customer || ! $this->order->customer->phone) {
                Log::warning('No customer phone for WhatsApp', ['order_id' => $this->order->id]);

                return;
            }

            // Prepare message data
            $customerName = $this->order->customer->full_name ?? $this->order->customer->first_name;
            $orderNumber = $this->order->order_number;
            $orderTotal = 'Rs. '.number_format($this->order->grand_total, 2);
            $deliveryAddress = $this->order->shipping_address ?? 'N/A';

            // Send WhatsApp message using template
            Log::info('WHATSAPP JOB START: send order template', [
                'order_id' => $this->order->id,
                'template' => 'order_confirmation',
            ]);

            $response = $whatsappService->sendTemplateMessage(
                $this->order->customer->phone,
                $customerName,
                $orderNumber,
                $orderTotal,
                $deliveryAddress,
                'order_confirmation' // Your WhatsApp template name
            );

            Log::info('WHATSAPP JOB RESPONSE: order template sent', [
                'order_id' => $this->order->id,
                'response' => $response,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send order WhatsApp', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
