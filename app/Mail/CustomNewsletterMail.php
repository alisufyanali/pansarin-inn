<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomNewsletterMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    // Use distinct property names — parent Mailable already owns $subject
    public string $emailSubject;
    public string $body;
    public string $recipientEmail;

    public function __construct(
        string $subject,
        string $body,
        string $recipientEmail,
    ) {
        $this->emailSubject   = $subject;
        $this->body           = $body;
        $this->recipientEmail = $recipientEmail;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->emailSubject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.custom-newsletter');
    }

    public function attachments(): array
    {
        return [];
    }
}
