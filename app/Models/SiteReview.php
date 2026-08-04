<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteReview extends Model
{
    protected $fillable = [
        'order_id',
        'order_number',
        'reviewer_name',
        'reviewer_email',
        'rating',
        'comment',
        'image',
        'status',
        'admin_note',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    // ── Relationships ─────────────────────────────────────────────

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // ── Scopes ────────────────────────────────────────────────────

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
