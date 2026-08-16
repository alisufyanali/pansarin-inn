<?php

namespace App\Notifications;

use App\Models\ProductReview;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProductReviewSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(public ProductReview $review) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $productName = $this->review->product?->name ?? 'Product';

        return [
            'product_review_id' => $this->review->id,
            'product_id'        => $this->review->product_id,
            'product_name'      => $productName,
            'customer_name'     => $this->review->customer_name,
            'rating'            => $this->review->rating,
            'message'           => "New product review for \"{$productName}\" — {$this->review->rating}/5 stars by {$this->review->customer_name}. Pending approval.",
            'action_url'        => '/admin/reviews',
        ];
    }
}
