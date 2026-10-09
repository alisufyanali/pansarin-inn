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
        'must_change_password',
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
            'email_verified_at'        => 'datetime',
            'password'                 => 'hashed',
            'two_factor_confirmed_at'  => 'datetime',
            'must_change_password'     => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // Deactivating an account (status = 0) signs it out of the storefront
        // API everywhere — login is already refused for inactive users.
        static::updated(function (User $user) {
            if ($user->wasChanged('status') && $user->status !== null && ! (bool) $user->status) {
                $user->tokens()->delete();
            }
        });
    }

    public function unreadNotificationsCount()
    {
        return $this->unreadNotifications()->count();
    }

    /**
     * Staff who get the admin bell notifications (new order, review, contact …).
     * Includes super-admin — notifying role('admin') alone skipped the owner.
     * whereHas instead of role([...]) so a role missing from the DB never throws.
     */
    public function scopeNotifiableStaff($query)
    {
        return $query->whereHas('roles', fn ($q) => $q->whereIn('name', ['super-admin', 'admin']));
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
     * 1. The affiliate who referred this user (the parent)
     */
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    /**
     * 2. The users this affiliate referred (the downline)
     */
    public function referrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    /**
     * 3. The affiliate's earnings (from the referrals table)
     * Jab ye user as an Affiliate kamaye ga
     */
    public function affiliateCommissions()
    {
        return $this->hasMany(Referral::class, 'affiliate_id');
    }

    /**
     * 4. The user's purchases (from the referrals table)
     * When this user buys something as a customer
     */
    public function customerPurchases()
    {
        return $this->hasMany(Referral::class, 'customer_id');
    }
}
