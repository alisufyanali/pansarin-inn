<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendCustomerWelcomeWhatsApp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $customer;

    /**
     * Create a new job instance.
     */
    public function __construct(Customer $customer)
    {
        $this->customer = $customer;
    }

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $whatsappService): void
    {
        try {
            if (!$this->customer->phone) {
                Log::warning('No phone number for customer welcome WhatsApp', ['customer_id' => $this->customer->id]);
                return;
            }

            $customerName = $this->customer->full_name ?? $this->customer->first_name;
            $message = "Hello {$customerName},\n\nWelcome to Pansari Inn! 🌿\n\nYour account has been successfully registered. We are thrilled to have you with us!\n\nBest regards,\nPansari Inn Team";

            Log::info('WHATSAPP JOB START: send customer welcome', [
                'customer_id' => $this->customer->id,
            ]);

            $response = $whatsappService->sendTextMessage($this->customer->phone, $message);

            \App\Models\WhatsappMessageLog::create([
                'phone' => preg_replace('/\D+/', '', $this->customer->phone),
                'customer_name' => $customerName,
                'order_id' => 'Welcome',
                'order_total' => 0,
                'delivery_address' => $this->customer->address ?? '',
                'messages' => $message,
                'api_response' => json_encode($response),
            ]);

            Log::info('WHATSAPP JOB RESPONSE: customer welcome sent', [
                'customer_id' => $this->customer->id,
                'response' => $response,
            ]);

        } catch (\Exception $e) {
            Log::error('WHATSAPP FAILED: Failed to send customer welcome WhatsApp', [
                'customer_id' => $this->customer->id,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
