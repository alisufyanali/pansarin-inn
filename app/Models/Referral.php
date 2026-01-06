<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    protected $fillable = [
        'affiliate_id', 'order_id', 'user_id', 
        'order_amount', 'commission_amount', 'status'
    ];

    public function affiliate() {
        return $this->belongsTo(Affiliate::class);
    }

    public function order() {
        return $this->belongsTo(Order::class);
    }
}