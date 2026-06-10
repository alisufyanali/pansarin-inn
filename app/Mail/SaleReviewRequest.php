<?php

namespace App\Mail;

use App\Models\Sale;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SaleReviewRequest extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Sale $sale) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We\'d love your feedback — ' . $this->sale->sale_code,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.sale.review-request',
            with: [
                'sale'     => $this->sale,
                'customer' => $this->sale->customer,
            ],
        );
    }

    public function attachments(): array { return []; }
}
