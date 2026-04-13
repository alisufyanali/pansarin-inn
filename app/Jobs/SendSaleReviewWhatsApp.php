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

        $whatsapp->sendTextMessage($customer->phone, $message);

        Log::info('Review WhatsApp sent', ['sale_id' => $this->sale->id]);
    }
}
