<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
    protected $fillable = [
        'customer_id', 'type', 'first_name', 'last_name', 
        'phone', 'address_line_1', 'city_id', 'country', 'is_default'
    ];

    public function customer() { return $this->belongsTo(Customer::class); }
    
    public function city() { return $this->belongsTo(City::class); }
}