<?php

use App\Models\Category;
use App\Models\Product;

it('lists only categories that have active products', function () {
    $full  = Category::create(['name' => 'Herb', 'slug' => 'herb', 'status' => true]);
    Category::create(['name' => 'Seeds', 'slug' => 'seeds', 'status' => true]);
    $hidden = Category::create(['name' => 'Old', 'slug' => 'old', 'status' => true]);

    Product::create(['category_id' => $full->id, 'name' => 'Neem', 'slug' => 'neem', 'sku' => 'N1', 'unit' => 'gm', 'status' => true]);
    Product::create(['category_id' => $hidden->id, 'name' => 'Gone', 'slug' => 'gone', 'sku' => 'G1', 'unit' => 'gm', 'status' => false]);

    $this->getJson('/api/categories')->assertOk()
        ->assertJsonPath('data.*.slug', ['herb']);
});

it('lists empty active categories too when asked (all-categories page)', function () {
    $full = Category::create(['name' => 'Herb', 'slug' => 'herb', 'status' => true, 'sort_order' => 1]);
    Category::create(['name' => 'Seeds', 'slug' => 'seeds', 'status' => true, 'sort_order' => 2]);
    Category::create(['name' => 'Off', 'slug' => 'off', 'status' => false, 'sort_order' => 3]);
    Product::create(['category_id' => $full->id, 'name' => 'Neem', 'slug' => 'neem', 'sku' => 'N1', 'unit' => 'gm', 'status' => true]);

    $data  = collect($this->getJson('/api/categories?include_empty=1')->assertOk()->json('data'));
    $slugs = $data->pluck('slug');

    expect($slugs)->toContain('herb', 'seeds')->not->toContain('off')
        ->and($data->firstWhere('slug', 'seeds')['products_count'])->toBe(0);
});

it('lists categories in the admin-set display order', function () {
    foreach ([['Oils', 'oils', 5], ['Herbs', 'herb', 1], ['Beauty Corner', 'beauty-corner', 99], ['Spices', 'spices', 3]] as [$name, $slug, $order]) {
        $c = Category::create(['name' => $name, 'slug' => $slug, 'status' => true, 'sort_order' => $order]);
        Product::create(['category_id' => $c->id, 'name' => "$name item", 'slug' => "$slug-item", 'sku' => strtoupper($slug), 'unit' => 'gm', 'status' => true]);
    }

    $this->getJson('/api/categories')->assertOk()
        ->assertJsonPath('data.*.slug', ['herb', 'spices', 'oils', 'beauty-corner']);
});
