<?php

use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogTag;

beforeEach(function () {
    // ── Blog Category with 3 published + 2 draft blogs ──
    $this->cat = BlogCategory::create([
        'name' => 'Herbal Remedies',
        'slug' => 'herbal-remedies',
    ]);

    for ($i = 1; $i <= 3; $i++) {
        Blog::create([
            'blog_category_id' => $this->cat->id,
            'title'   => "Published Post {$i}",
            'slug'    => "published-post-{$i}",
            'content' => 'Lorem ipsum content.',
            'excerpt' => 'Short excerpt.',
            'status'  => 'published',
        ]);
    }
    for ($i = 1; $i <= 2; $i++) {
        Blog::create([
            'blog_category_id' => $this->cat->id,
            'title'   => "Draft Post {$i}",
            'slug'    => "draft-post-{$i}",
            'content' => 'Not yet public.',
            'excerpt' => 'TBD.',
            'status'  => 'draft',
        ]);
    }

    // ── Blog Tag attached to all 5 blogs (3 published + 2 draft) ──
    $this->tag = BlogTag::create([
        'name'      => 'Ayurveda',
        'slug'      => 'ayurveda',
        'color'     => '#10B981',
        'is_active' => true,
    ]);
    $this->tag->blogs()->attach(Blog::pluck('id')->all());

    // ── An inactive tag that should be hidden from public endpoint ──
    $this->inactiveTag = BlogTag::create([
        'name'      => 'Legacy Tag',
        'slug'      => 'legacy-tag',
        'color'     => '#6B7280',
        'is_active' => false,
    ]);

    // ── A second empty category to test zero count ──
    $this->emptyCat = BlogCategory::create([
        'name' => 'Empty Category',
        'slug' => 'empty-category',
    ]);
});

it('GET /api/blog-categories returns blogs_count = 3 published (drafts excluded)', function () {
    $response = $this->getJson('/api/blog-categories');

    $response->assertStatus(200)
        ->assertJsonPath('success', true);

    $data = collect($response->json('data'));
    $herbal = $data->firstWhere('slug', 'herbal-remedies');
    $empty  = $data->firstWhere('slug', 'empty-category');

    expect($herbal)->not->toBeNull();
    expect($herbal['blogs_count'])->toBe(3,
        "blogs_count should be 3 (published only), got {$herbal['blogs_count']} — scopePublished used via withCount constraint"
    );

    expect($empty)->not->toBeNull();
    expect($empty['blogs_count'])->toBe(0);

    expect($data->sum('blogs_count'))->toBe(3);
});

it('GET /api/blog-tags returns blogs_count = 3 published + hides inactive tags', function () {
    $response = $this->getJson('/api/blog-tags');

    $response->assertStatus(200)
        ->assertJsonPath('success', true);

    $data = collect($response->json('data'));
    $slugs = $data->pluck('slug')->all();

    expect($slugs)->toContain('ayurveda');
    expect($slugs)->not->toContain('legacy-tag',
        'Inactive tags (is_active=false) MUST be excluded from public blog-tags endpoint via scopeActive'
    );

    $ayur = $data->firstWhere('slug', 'ayurveda');
    expect($ayur['blogs_count'])->toBe(3,
        "Tag blogs_count should be 3 (published only), got {$ayur['blogs_count']} — scopePublished constraint on withCount"
    );

    expect($ayur['color'])->toBe('#10B981');
    expect($ayur['is_active'])->toBeTrue();
});

it('(scope confirmation) BlogCategory::published-count SQL uses scopePublished — direct Eloquent proof', function () {
    $cat = BlogCategory::withCount([
        'blogs' => fn ($q) => $q->published(),
    ])->find($this->cat->id);

    expect($cat->blogs_count)->toBe(3);

    // Prove raw total (without scope) would be 5
    $raw = BlogCategory::withCount('blogs')->find($this->cat->id);
    expect($raw->blogs_count)->toBe(5,
        "Raw all-time total MUST be 5; if it's not 3 after published(), the scope constraint is missing"
    );

    // Same proof for tags
    $tag = BlogTag::withCount(['blogs' => fn ($q) => $q->published()])->find($this->tag->id);
    expect($tag->blogs_count)->toBe(3);

    $tagRaw = BlogTag::withCount('blogs')->find($this->tag->id);
    expect($tagRaw->blogs_count)->toBe(5);
});

it('(scope confirmation) Blog::published() scope explicitly filters status=published', function () {
    $publishedIds = Blog::published()->pluck('id')->sort()->values()->all();
    $allIds       = Blog::pluck('id')->sort()->values()->all();

    expect(count($publishedIds))->toBe(3);
    expect(count($allIds))->toBe(5);
    expect($publishedIds)->not->toBe($allIds,
        "scopePublished must reduce 5 to 3 — checks scopePublished existence and WHERE status='published'"
    );

    foreach (Blog::published()->get() as $b) {
        expect($b->status)->toBe('published');
    }
});
