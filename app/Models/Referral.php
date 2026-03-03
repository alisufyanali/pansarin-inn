<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    protected $fillable = [
        'affiliate_id', 'order_id', 'customer_id', 'level',
        'order_amount', 'commission_amount', 'status', 'referral_type', 'commission_rate_snapshot',
    ];

    public function affiliate() {
    return $this->belongsTo(User::class, 'affiliate_id');
    }

    public function customer() {
        return $this->belongsTo(User::class, 'customer_id');
    }
}