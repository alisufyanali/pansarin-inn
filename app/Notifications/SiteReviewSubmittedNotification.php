<?php

namespace App\Notifications;

use App\Models\SiteReview;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SiteReviewSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(public SiteReview $review) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'site_review_id' => $this->review->id,
            'order_number'   => $this->review->order_number,
            'reviewer_name'  => $this->review->reviewer_name,
            'rating'         => $this->review->rating,
            'message'        => "New site review submitted by {$this->review->reviewer_name} — {$this->review->rating}/5 stars. Pending approval.",
            'action_url'     => '/admin/site-reviews',
        ];
    }
}
