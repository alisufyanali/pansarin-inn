<?php

use App\Models\Category;
use App\Models\Product;

it('lists live product and blog slugs for the storefront', function () {
    $c = Category::create(['name' => 'Herb', 'slug' => 'herb', 'status' => true]);
    Product::create(['category_id' => $c->id, 'name' => 'Ajwain', 'slug' => 'ajwaindesi', 'sku' => 'A1', 'unit' => 'gm', 'status' => true]);
    Product::create(['category_id' => $c->id, 'name' => 'Old', 'slug' => 'old-one', 'sku' => 'O1', 'unit' => 'gm', 'status' => false]);

    $this->getJson('/api/slugs')->assertOk()
        ->assertJsonPath('data.products', ['ajwaindesi']);
});

it('never gives a product a slug that is a storefront page', function () {
    expect(Product::RESERVED_SLUGS)->toContain('herb', 'shop', 'blog', 'product');

    $method = new ReflectionMethod(\App\Http\Repositories\Admin\ProductRepository::class, 'generateUniqueSlug');
    $slug = $method->invoke(app(\App\Http\Repositories\Admin\ProductRepository::class), 'Herb');

    expect($slug)->toBe('herb-1');
});
