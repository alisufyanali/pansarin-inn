<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'username',
        'status',
        'referred_by',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function unreadNotificationsCount()
    {
        return $this->unreadNotifications()->count();
    }

    public function customer()
    {
        return $this->hasOne(Customer::class);
    }

    public function affiliate()
    {
        return $this->hasOne(Affiliate::class);
    }

    public function isAffiliate()
    {
        return $this->hasRole('affiliate');
    }

    public function isCustomer()
    {
        return $this->hasRole('customer');
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    /**
 * 1. Jis Affiliate ne is user ko refer kiya (The Parent)
 */
public function referrer()
{
    return $this->belongsTo(User::class, 'referred_by');
}

/**
 * 2. Wo Users jinko is Affiliate ne refer kiya (The Downline)
 */
public function referrals()
{
    return $this->hasMany(User::class, 'referred_by');
}

/**
 * 3. Affiliate ki earnings (Referral Table se)
 * Jab ye user as an Affiliate kamaye ga
 */
public function affiliateCommissions()
{
    return $this->hasMany(Referral::class, 'affiliate_id');
}

/**
 * 4. User ki purchases (Referral Table se)
 * Jab ye user as a Customer kuch khareeday ga
 */
public function customerPurchases()
{
    return $this->hasMany(Referral::class, 'customer_id');
}
}
