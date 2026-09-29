<?php

use App\Models\ProductReview;

beforeEach(function () {
    $category = \App\Models\Category::create(['name' => 'Test', 'slug' => 'test', 'status' => true]);
    $this->product = \App\Models\Product::create([
        'category_id' => $category->id, 'name' => 'Test Herb', 'slug' => 'test-herb',
        'sku' => 'TH-001', 'unit' => 'gm', 'status' => true,
    ]);
});

it('counts one helpful vote per IP', function () {
    $review = ProductReview::create([
        'product_id' => $this->product->id, 'customer_name' => 'A', 'rating' => 5,
        'comment' => 'Very good product', 'status' => true,
    ]);

    $this->postJson("/api/reviews/{$review->id}/helpful")->assertOk();
    $this->postJson("/api/reviews/{$review->id}/helpful")->assertStatus(429);

    expect($review->fresh()->helpful_count)->toBe(1);
});

it('lets a guest review a product once per day from the same IP', function () {
    $payload = ['name' => 'Guest', 'rating' => 4, 'comment' => 'Nice and fresh herbs'];

    $this->postJson('/api/products/test-herb/reviews', $payload)->assertStatus(201);
    $this->postJson('/api/products/test-herb/reviews', $payload)->assertStatus(429);

    expect(ProductReview::count())->toBe(1);
});

it('caps per_page on public listings', function () {
    $this->getJson('/api/products?per_page=100000')
        ->assertOk()
        ->assertJsonPath('meta.per_page', 100);
});

it('ignores a malformed sort column instead of failing', function () {
    expect(\App\Support\SortInput::column('name->x', 'id'))->toBe('id')
        ->and(\App\Support\SortInput::column('products.name', 'id'))->toBe('products.name')
        ->and(\App\Support\SortInput::direction('DESC; drop'))->toBe('desc')
        ->and(\App\Support\SortInput::direction('ASC'))->toBe('asc');
});
