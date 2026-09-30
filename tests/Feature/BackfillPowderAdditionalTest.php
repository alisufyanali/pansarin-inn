<?php

use App\Models\ProductVariant;

it('sets additional = 100 only on Powder variants that have none', function () {
    $category = \App\Models\Category::create(['name' => 'Herbs', 'slug' => 'herbs', 'status' => true]);
    $product  = \App\Models\Product::create(['category_id' => $category->id, 'name' => 'Neem', 'slug' => 'neem', 'sku' => 'N1', 'unit' => 'gm', 'status' => true]);
    $make = fn (string $sku, array $attrs, int $additional = 0) => ProductVariant::create([
        'product_id' => $product->id, 'sku' => $sku, 'value' => $sku, 'attributes' => $attrs,
        'additional' => $additional, 'price' => 100, 'status' => true,
    ]);

    $powder  = $make('P1', ['Weight' => '50', 'Form' => 'Powder']);
    $lower   = $make('P2', ['Weight' => '100', 'Form' => 'powder']);
    $already = $make('P3', ['Weight' => '250', 'Form' => 'Powder'], 150);
    $whole   = $make('W1', ['Weight' => '50', 'Form' => 'Whole']);
    $none    = $make('O1', ['Size' => '30']);

    $this->artisan('backfill:powder-additional')->assertSuccessful();

    expect($powder->fresh()->additional)->toBe(100)
        ->and($lower->fresh()->additional)->toBe(100)
        ->and($already->fresh()->additional)->toBe(150)
        ->and($whole->fresh()->additional)->toBe(0)
        ->and($none->fresh()->additional)->toBe(0);
});
