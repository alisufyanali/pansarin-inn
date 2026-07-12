<?php

namespace App\Jobs;

use App\Mail\SaleConfirmationMail;
use App\Models\Sale;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSaleConfirmationEmail implements ShouldQueue
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
            $this->sale->load(['customer', 'order', 'items.product', 'items.variant']);

            // Check if customer has email
            if (! $this->sale->customer || ! $this->sale->customer->email) {
                Log::info("Sale {$this->sale->sale_code}: Customer has no email address");

                return;
            }

            // Send email
            Mail::to($this->sale->customer->email)
                ->send(new SaleConfirmationMail($this->sale));

            Log::info("Sale confirmation email sent for sale: {$this->sale->sale_code}");

        } catch (\Exception $e) {
            Log::error('MAIL FAILED: Failed to send sale confirmation email', [
                'sale_id'  => $this->sale->id,
                'message'  => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw $e;
        }
    }
}
