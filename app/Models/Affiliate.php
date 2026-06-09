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

    /**
     * Booted method to handle auto-syncing with Wallet
     */
    protected static function booted()
    {
        // Jab bhi affiliate update ho (e.g. balance change ho)
        static::updated(function ($affiliate) {
            if ($affiliate->wasChanged('balance')) {
                // Wallet check karein, agar nahi hai to create karein aur balance sync karein
                $affiliate->wallet()->updateOrCreate(
                    [
                        'walletable_id'   => $affiliate->id,
                        'walletable_type' => Affiliate::class,
                    ],
                    [
                        'balance' => $affiliate->balance
                    ]
                );
            }
        });

        // Jab pehli baar koi naya affiliate join kare, uska wallet 0 balance se create ho jaye
        static::created(function ($affiliate) {
            $affiliate->wallet()->create([
                'balance' => $affiliate->balance ?? 0
            ]);
        });
    }


    public function user() {
        return $this->belongsTo(User::class);
    }

    public function referrals() {
        return $this->hasMany(Referral::class);
    }

    public function commissions()
    {
        return $this->hasMany(AffiliateCommission::class);
    }

    /**
     * Get the payment methods for the affiliate.
     */
    public function paymentMethods(): HasMany
    {
        return $this->hasMany(PaymentMethod::class);
    }

    /**
     * Get the payout requests for the affiliate.
     */
    public function payoutRequests(): HasMany
    {
        return $this->hasMany(PayoutRequest::class);
    }
    
    /**
     * Get the affiliate's wallet.
     * (Polymorphic relation agar aap morphOne use kar rahe hain)
     */
    public function wallet()
    {
        return $this->morphOne(Wallet::class, 'walletable');
    }
}