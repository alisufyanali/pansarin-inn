<?php

use App\Models\Category;
use App\Models\Product;

beforeEach(function () {
    $c = Category::create(['name' => 'Herb', 'slug' => 'herb', 'status' => true]);
    foreach (['Ashwagandha Powder' => 'ashwagandha-powder', 'Moringa Leaves Powder' => 'moringa', 'Akarkara Powder' => 'akarkara', 'Kalonji' => 'kalonji'] as $name => $slug) {
        Product::create(['category_id' => $c->id, 'name' => $name, 'slug' => $slug, 'sku' => strtoupper($slug), 'unit' => 'gm', 'status' => true]);
    }
});

it('suggests the closest product when a misspelt search finds nothing', function () {
    $this->getJson('/api/products?search=ashwaganda')->assertOk()
        ->assertJsonPath('meta.total', 0)
        ->assertJsonPath('meta.suggestions.0.slug', 'ashwagandha-powder');

    $this->getJson('/api/products?search=kalongi')->assertOk()
        ->assertJsonPath('meta.suggestions.0.name', 'Kalonji');
});

it('needs every word to be close, so a shared word alone is not a match', function () {
    $this->getJson('/api/products?search=moringa%20powdr')->assertOk()
        ->assertJsonPath('meta.suggestions.*.slug', ['moringa']);
});

it('gives no suggestions when the search has results or is nonsense', function () {
    $this->getJson('/api/products?search=kalonji')->assertJsonPath('meta.suggestions', []);
    $this->getJson('/api/products?search=xyzqwe')->assertJsonPath('meta.suggestions', []);
});
