<?php

// app/Jobs/SendOrderWhatsAppNotification.php

namespace App\Jobs;

use App\Exceptions\WhatsAppApiException;
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
            $customerName    = $this->order->customer->full_name ?? $this->order->customer->first_name;
            $orderNumber     = $this->order->order_number;
            $grandTotal      = (float) $this->order->grand_total;          // raw numeric — for DB log
            $orderTotalFormatted = 'Rs. ' . number_format($grandTotal, 2); // display string — for template
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
                $grandTotal,              // numeric for saveMessageLog → decimal column
                $orderTotalFormatted,     // formatted string for WhatsApp template body
                $deliveryAddress,
                'order_confirmation'
            );

            $whatsappService->throwIfFailed($response);

            Log::info('WHATSAPP JOB RESPONSE: order template sent', [
                'order_id' => $this->order->id,
                'response' => $response,
            ]);

        } catch (WhatsAppApiException $e) {
            Log::error('Order WhatsApp rejected by Meta', [
                'order_id'  => $this->order->id,
                'error'     => $e->getMessage(),
                'retryable' => $e->retryable,
            ]);

            // A retry cannot fix e.g. a number outside the allow-list
            if (! $e->retryable) {
                $this->fail($e);
                return;
            }

            throw $e;
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
