<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerGroup extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'discount_percentage', 'is_default'];

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }
}
