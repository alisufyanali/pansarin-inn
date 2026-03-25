<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class City extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'shipping_charges', 'state_id'];

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }
}