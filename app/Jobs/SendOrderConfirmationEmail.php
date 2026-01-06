<?php

namespace App\Jobs;

use App\Models\Order;
use App\Mail\OrderConfirmation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

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
                Mail::to($this->order->customer->email)
                    ->send(new OrderConfirmation($this->order));
                    
                Log::info('Order confirmation email sent', [
                    'order_id' => $this->order->id,
                    'customer_email' => $this->order->customer->email
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send order confirmation email', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }
}