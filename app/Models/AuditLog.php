<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id','action','module','old_values','new_values',
        'ip_address','user_agent'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

