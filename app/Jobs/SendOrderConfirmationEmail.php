<?php

namespace App\Jobs;

use App\Mail\OrderConfirmation;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

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
    public function handle(): void
    {
        try {
            // Load relationships
            $this->order->load(['customer', 'items.product']);

            // Check if customer has email
            if ($this->order->customer && $this->order->customer->email) {
                // Mail::to($this->order->customer->email)
                Mail::to('fefadaf184@ixospace.com')
                    ->send(new OrderConfirmation($this->order));

                Log::info('Order confirmation email sent', [
                    'order_id' => $this->order->id,
                    'customer_email' => $this->order->customer->email,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send order confirmation email', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
