<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class City extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'shipping_charges', 'province'];

    protected $casts = [
        'shipping_charges' => 'decimal:2',
    ];

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }
}