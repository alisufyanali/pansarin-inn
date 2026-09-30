<?php

use App\Models\Product;
use App\Models\ProductVariant;

beforeEach(function () {
    $category = \App\Models\Category::create(['name' => 'Herbs', 'slug' => 'herbs', 'status' => true]);

    // [slug, [[price, sale_price, additional], ...]] — card price = cheapest (sale ?? price) + additional
    foreach ([
        'expensive' => [[1199, null, 0]],
        'on-sale'   => [[1500, 699, 0]],        // card 699, although price column is 1500
        'surcharge' => [[600, null, 150]],      // card 750
        'two-sizes' => [[80, null, 0], [500, null, 0]], // card 80
    ] as $slug => $variants) {
        $p = Product::create(['category_id' => $category->id, 'name' => ucfirst($slug), 'slug' => $slug, 'sku' => strtoupper($slug), 'unit' => 'gm', 'status' => true]);
        foreach ($variants as $i => [$price, $sale, $add]) {
            ProductVariant::create([
                'product_id' => $p->id, 'sku' => strtoupper($slug) . $i, 'value' => ($i + 1) . '00 gm',
                'attributes' => ['Weight' => ($i + 1) . '00'], 'price' => $price, 'sale_price' => $sale,
                'additional' => $add, 'is_default' => $i === 0, 'status' => true,
            ]);
        }
    }
});

it('sorts by the price shown on the card', function () {
    $this->getJson('/api/products?sort_by=price&sort_order=asc')->assertOk()
        ->assertJsonPath('data.*.slug', ['two-sizes', 'on-sale', 'surcharge', 'expensive']);

    $this->getJson('/api/products?sort_by=price&sort_order=desc')->assertOk()
        ->assertJsonPath('data.*.slug', ['expensive', 'surcharge', 'on-sale', 'two-sizes']);
});

it('filters by the price shown on the card', function () {
    $this->getJson('/api/products?min_price=600&max_price=1000&sort_by=price')->assertOk()
        ->assertJsonPath('data.*.slug', ['on-sale', 'surcharge']);
});
