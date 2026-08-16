<?php

namespace App\Notifications;

use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContactMessageNotification extends Notification
{
    use Queueable;

    public function __construct(public Contact $contact) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $subject = $this->contact->subject ?: '(no subject)';

        return [
            'contact_id' => $this->contact->id,
            'name'       => $this->contact->name,
            'email'      => $this->contact->email,
            'phone'      => $this->contact->phone,
            'subject'    => $this->contact->subject,
            'message'    => "New contact message from {$this->contact->name} ({$this->contact->email}): \"{$subject}\"",
            'action_url' => '/admin/contacts',
        ];
    }
}
