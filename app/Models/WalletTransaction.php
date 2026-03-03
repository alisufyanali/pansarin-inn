<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    protected $fillable = [
        'wallet_id', 'amount', 'type', 'action', 'reference_id', 'reference_type', 'description'
    ];

    public function wallet() { return $this->belongsTo(Wallet::class); }
    public function reference() { return $this->morphTo(); }
    
}
