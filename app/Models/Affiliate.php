<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Affiliate extends Model
{
    protected $fillable = [
        'user_id', 'affiliate_code', 'commission_rate', 'balance',
        'payment_method', 'payment_account_title', 'payment_iban_details',
        'payment_account_no_details', 'status', 'parent_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(PayoutRequest::class);
    }

    // Downline logic: Is affiliate ne kin ko join karwaya
    public function downline(): HasMany
    {
        return $this->hasMany(Affiliate::class, 'parent_id');
    }
}
