<?php

namespace App\Jobs;

use App\Mail\SaleReviewRequest;
use App\Models\Sale;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSaleReviewEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 30;
    public int $backoff = 60;

    public function __construct(public Sale $sale) {}

    public function handle(): void
    {
        $this->sale->loadMissing('customer');

        if ($this->sale->customer?->email) {
            Mail::to($this->sale->customer->email)
                ->send(new SaleReviewRequest($this->sale));

            Log::info('Review email sent', ['sale_id' => $this->sale->id]);
        }
    }
}
