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

it('lists categories in the admin-set display order', function () {
    foreach ([['Oils', 'oils', 5], ['Herbs', 'herb', 1], ['Beauty Corner', 'beauty-corner', 99], ['Spices', 'spices', 3]] as [$name, $slug, $order]) {
        $c = Category::create(['name' => $name, 'slug' => $slug, 'status' => true, 'sort_order' => $order]);
        Product::create(['category_id' => $c->id, 'name' => "$name item", 'slug' => "$slug-item", 'sku' => strtoupper($slug), 'unit' => 'gm', 'status' => true]);
    }

    $this->getJson('/api/categories')->assertOk()
        ->assertJsonPath('data.*.slug', ['herb', 'spices', 'oils', 'beauty-corner']);
});
