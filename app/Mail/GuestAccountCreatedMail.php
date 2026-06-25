<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuestAccountCreatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $customerName;
    public string $customerEmail;
    public string $customerPhone;
    public string $orderNumber;

    public function __construct(
        string $customerName,
        string $customerEmail,
        string $customerPhone,
        string $orderNumber
    ) {
        $this->customerName  = $customerName;
        $this->customerEmail = $customerEmail;
        $this->customerPhone = $customerPhone;
        $this->orderNumber   = $orderNumber;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Pansari Inn Account & Order Confirmation',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.guest.account-created',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
