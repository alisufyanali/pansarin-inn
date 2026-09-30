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
