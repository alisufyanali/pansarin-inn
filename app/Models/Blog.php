<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'blog_category_id',
        'title',
        'slug',
        'content',
        'excerpt',
        'status',
        'thumbnail',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'schema_markup',
        'social_image',
        'social_description',
    ];

    /**
     * Get the category that owns the blog.
     */
    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    /**
     * Get the comments for the blog post.
     */
    public function comments()
    {
        return $this->hasMany(BlogComments::class);
    }

    /**
     * Get all tags associated with this blog (Many-to-Many)
     */
    public function tags()
    {
        return $this->belongsToMany(BlogTag::class, 'blog_blog_tag', 'blog_id', 'blog_tag_id')
                    ->withTimestamps();
    }

    /**
     * Sync tags with the blog
     */
    public function syncTags(array $tagIds)
    {
        $this->tags()->sync($tagIds);
    }

    /**
     * Attach a tag to the blog
     */
    public function attachTag($tagId)
    {
        $this->tags()->attach($tagId);
    }

    /**
     * Detach a tag from the blog
     */
    public function detachTag($tagId)
    {
        $this->tags()->detach($tagId);
    }
}