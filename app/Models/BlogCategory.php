<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'parent_id',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'schema_markup',
        'social_image',
        'social_description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Parent relationship
    public function parent()
    {
        return $this->belongsTo(BlogCategory::class, 'parent_id');
    }

    // Children relationship
    public function children()
    {
        return $this->hasMany(BlogCategory::class, 'parent_id');
    }

    // Blog posts relationship
    public function blogs()
    {
        return $this->hasMany(Blog::class, 'blog_category_id');
    }
}