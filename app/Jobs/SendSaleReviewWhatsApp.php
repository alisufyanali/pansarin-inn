<?php

namespace App\Jobs;

use App\Models\Sale;
use App\Models\WhatsappMessageLog;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; 
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSaleReviewWhatsApp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Sale $sale) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $this->sale->loadMissing('customer');

        $customer = $this->sale->customer;
        if (!$customer?->phone) return;

        $name    = $customer->first_name ?? 'Customer';
        $code    = $this->sale->sale_code;
        $link    = url('/review/' . $code);

        $message = "Assalam o Alaikum {$name}! 🌿\n\n"
            . "Thank you for your order *{$code}* from *Pansari Inn*.\n\n"
            . "We'd love to hear your feedback! Please leave a review:\n"
            . "{$link}\n\n"
            . "JazakAllah Khair 🙏";

        Log::info('WHATSAPP JOB START: send sale review message', [
            'sale_id' => $this->sale->id,
            'phone' => $customer->phone,
            'clean_phone' => preg_replace('/\D+/', '', $customer->phone),
            'message' => $message,
        ]);

        $response = $whatsapp->sendTextMessage($customer->phone, $message);

        // Save to WhatsApp message log so it appears in chat UI
        \App\Models\WhatsappMessageLog::create([
            'phone'            => preg_replace('/\D+/', '', $customer->phone),
            'customer_name'    => $customer->full_name ?? $customer->first_name,
            'order_id'         => $code,
            'order_total'      => $this->sale->grand_total,
            'delivery_address' => $this->sale->shipping_address ?? '',
            'messages'         => $message,
            'api_response'     => json_encode($response),
        ]);

        Log::info('WHATSAPP JOB RESPONSE: sale review message sent', ['sale_id' => $this->sale->id, 'response' => $response]);
    }
}
