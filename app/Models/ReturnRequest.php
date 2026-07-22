<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnRequest extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'status',
        'reason_category',
        'comment',
        'refund_amount',
        'admin_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at'   => 'datetime',
        'refund_amount' => 'float',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Customer profile via user — used for display in admin panel.
     */
    public function customer()
    {
        return $this->hasOneThrough(Customer::class, User::class, 'id', 'user_id', 'user_id', 'id');
    }

    public function items()
    {
        return $this->hasMany(ReturnRequestItem::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
