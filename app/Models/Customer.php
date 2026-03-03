<?php

namespace App\Models;

use App\Models\Referral; 
use App\Models\Affiliate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'customer_group_id', 'first_name', 'last_name', 'address','city_id',
        'email', 'phone', 'gender', 'dob', 'profile_picture', 'country',
        'status', 'total_spent', 'total_orders'
    ];

    protected $appends = ['full_name'];

    public function city() { return $this->belongsTo(City::class); }
    public function getFullNameAttribute() { return trim($this->first_name.' '.$this->last_name); }
    public function user() { return $this->belongsTo(User::class); }
    public function customerGroup() { return $this->belongsTo(CustomerGroup::class, 'customer_group_id'); }
    public function addresses() { return $this->hasMany(CustomerAddress::class); }
    public function wallet() { return $this->morphOne(Wallet::class, 'walletable'); }
    public function walletTransactions() { return $this->hasManyThrough(WalletTransaction::class, Wallet::class, 'walletable_id', 'wallet_id')->where('walletable_type', Customer::class); }
    public function loyaltyPoints() { return $this->hasOne(LoyaltyPoint::class); }
    public function loyaltyTransactions() { return $this->hasMany(LoyaltyPointTransaction::class, 'loyalty_point_id', 'id'); }
    public function orders() { return $this->hasMany(Order::class); }
    public function referredBy() {return $this->hasOne(Referral::class, 'customer_id', 'user_id'); }
    public function referralSales() { return $this->hasManyThrough( Referral::class, Affiliate::class, 'user_id', 'affiliate_id', 'user_id', 'id'); }
}