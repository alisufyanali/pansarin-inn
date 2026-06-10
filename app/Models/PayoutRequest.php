<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayoutRequest extends Model
{
    protected $fillable = [
        'affiliate_id', 'amount', 'status', 
        'transaction_id', 'payment_method_snapshot', 
        'payment_details_snapshot', 'admin_note'
    ];

    protected $casts = [
        'payment_details_snapshot' => 'array',
    ];

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function payoutRequests()
    {
        return $this->hasMany(PayoutRequest::class);
    }

    public function wallet()
    {
        return $this->morphOne(Wallet::class, 'walletable');
    }

    public function paymentMethods()
    {
        return $this->morphMany(PaymentMethod::class, 'owner');
    }
}
