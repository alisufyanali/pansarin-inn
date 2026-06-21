<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageCategoryProduct extends Model
{
    protected $fillable = ['category_id', 'product_id', 'sort_order'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
