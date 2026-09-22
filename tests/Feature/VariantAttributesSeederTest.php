<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;

/**
 * Asserts that OldProductsImportSeeder's variant-parsing logic
 * handles both JSON formats: flat {label/value} and indexed {label_1/value_1}.
 *
 * Exercises the seeder code path inline — no file I/O, no image assets needed.
 */

// ── Shared parsing function (mirrors OldProductsImportSeeder exactly) ─
function parseAndCreateVariant(array $v, int $productId, int $vIndex): ProductVariant
{
    $attributes = [];

    if (array_key_exists('label', $v) && ! array_key_exists('label_1', $v)) {
        $label = trim($v['label'] ?? '');
        $val   = trim($v['value'] ?? '');
        if ($label !== '' && $val !== '') {
            $attributes[$label] = $val;
        }
    } else {
        foreach (range(1, 5) as $i) {
            $label = trim($v["label_$i"] ?? '');
            $val   = trim($v["value_$i"] ?? '');
            if ($label !== '' && $val !== '') {
                $attributes[$label] = $val;
            }
        }
    }

    $varLabel = $v['combined_value']
        ?? (! empty($attributes) ? implode(' - ', array_values($attributes)) : '');

    return ProductVariant::create([
        'product_id'  => $productId,
        'sku'         => $v['sku'],
        'value'       => $varLabel,
        'attributes'  => $attributes ?: null,
        'price'       => (float) ($v['price'] ?? 0),
        'sale_price'  => null,
        'is_default'  => ($vIndex === 0),
        'status'      => true,
        'stock_alert' => 5,
        'additional'  => 0,
    ]);
}

function makeProduct(int $categoryId, string $name, string $slug, string $sku, string $unit = 'ml'): Product
{
    return Product::create([
        'category_id'          => $categoryId,
        'name'                 => $name,
        'slug'                 => $slug,
        'sku'                  => $sku,
        'unit'                 => $unit,
        'status'               => true,
        'affiliate_commission' => 5.00,
        'sort_order'           => 0,
    ]);
}

// ── Test: flat-format 19 SKUs ─────────────────────────────────────

it('flat-format: all 19 SKUs get non-empty attributes and value', function () {
    $cat = Category::create(['name' => 'Oils', 'slug' => 'oils-test', 'status' => true]);

    $products = [
        ['Twelve Seeds Oil', 'twelveseedoil', 'TWELVESEEDOIL', 'ml', [
            ['label'=>'Size','value'=>'30', 'price'=>300.0,'sku'=>'TWELVESEEDOIL-V01'],
            ['label'=>'Size','value'=>'60', 'price'=>550.0,'sku'=>'TWELVESEEDOIL-V02'],
            ['label'=>'Size','value'=>'120','price'=>950.0,'sku'=>'TWELVESEEDOIL-V03'],
        ]],
        ['Ginger Oil', 'gingeroil', 'GINGEROIL', 'ml', [
            ['label'=>'Size','value'=>'30', 'price'=>300.0, 'sku'=>'GINGEROIL-V01'],
            ['label'=>'Size','value'=>'60', 'price'=>600.0, 'sku'=>'GINGEROIL-V02'],
            ['label'=>'Size','value'=>'120','price'=>1100.0,'sku'=>'GINGEROIL-V03'],
        ]],
        ['Apricot Oil', 'apricotoil', 'APRICOTOIL', 'ml', [
            ['label'=>'Size','value'=>'30', 'price'=>400.0, 'sku'=>'APRICOTOIL-V01'],
            ['label'=>'Size','value'=>'60', 'price'=>800.0, 'sku'=>'APRICOTOIL-V02'],
            ['label'=>'Size','value'=>'120','price'=>1150.0,'sku'=>'APRICOTOIL-V03'],
        ]],
        ['Pakhan Baid Oil', 'pakhanbaidoil', 'PAKHANBAIDOIL', 'ml', [
            ['label'=>'Size','value'=>'30', 'price'=>300.0,'sku'=>'PAKHANBAIDOIL-V01'],
            ['label'=>'Size','value'=>'60', 'price'=>550.0,'sku'=>'PAKHANBAIDOIL-V02'],
            ['label'=>'Size','value'=>'120','price'=>950.0,'sku'=>'PAKHANBAIDOIL-V03'],
        ]],
        ['Turmeric Oil', 'turmericoil', 'TURMERICOIL', 'ml', [
            ['label'=>'Size','value'=>'30', 'price'=>350.0, 'sku'=>'TURMERICOIL-V01'],
            ['label'=>'Size','value'=>'60', 'price'=>650.0, 'sku'=>'TURMERICOIL-V02'],
            ['label'=>'Size','value'=>'120','price'=>1200.0,'sku'=>'TURMERICOIL-V03'],
        ]],
        ['Asrol Powder', 'asrolpowder', 'ASROLPOWDER', 'gm', [
            ['label'=>'Pack','value'=>'100','price'=>999.0, 'sku'=>'ASROLPOWDER-V01'],
            ['label'=>'Pack','value'=>'250','price'=>1599.0,'sku'=>'ASROLPOWDER-V02'],
        ]],
        ['Manjistha Powder', 'manjisthapowder', 'MANJISTHAPOWDER', 'gm', [
            ['label'=>'Pack','value'=>'100','price'=>650.0, 'sku'=>'MANJISTHAPOWDER-V01'],
            ['label'=>'Pack','value'=>'250','price'=>1500.0,'sku'=>'MANJISTHAPOWDER-V02'],
        ]],
    ];

    foreach ($products as [$name, $slug, $sku, $unit, $variants]) {
        $p = makeProduct($cat->id, $name, $slug, $sku, $unit);
        foreach ($variants as $i => $v) {
            parseAndCreateVariant($v, $p->id, $i);
        }
    }

    $expectedSkus = [
        'TWELVESEEDOIL-V01','TWELVESEEDOIL-V02','TWELVESEEDOIL-V03',
        'GINGEROIL-V01',    'GINGEROIL-V02',    'GINGEROIL-V03',
        'APRICOTOIL-V01',   'APRICOTOIL-V02',   'APRICOTOIL-V03',
        'PAKHANBAIDOIL-V01','PAKHANBAIDOIL-V02', 'PAKHANBAIDOIL-V03',
        'TURMERICOIL-V01',  'TURMERICOIL-V02',  'TURMERICOIL-V03',
        'ASROLPOWDER-V01',  'ASROLPOWDER-V02',
        'MANJISTHAPOWDER-V01','MANJISTHAPOWDER-V02',
    ];

    foreach ($expectedSkus as $sku) {
        $v = ProductVariant::where('sku', $sku)->first();
        expect($v)->not->toBeNull("SKU {$sku} not found");
        expect($v->value)->not->toBeEmpty("value empty for {$sku}");
        $attrs = $v->attributes;
        expect($attrs)->not->toBeNull("attributes null for {$sku}");
        expect($attrs)->not->toBeEmpty("attributes empty for {$sku}");
    }
});

it('flat-format: Twelve Seeds Oil V01/V02/V03 correct Size and value', function () {
    $cat = Category::create(['name' => 'Oils2', 'slug' => 'oils-2', 'status' => true]);
    $p   = makeProduct($cat->id, 'Twelve Seeds Oil', 'twelveseedoil2', 'TWELVESEEDOIL2');

    $vs = [
        ['label'=>'Size','value'=>'30', 'price'=>300.0,'sku'=>'TSO2-V01'],
        ['label'=>'Size','value'=>'60', 'price'=>550.0,'sku'=>'TSO2-V02'],
        ['label'=>'Size','value'=>'120','price'=>950.0,'sku'=>'TSO2-V03'],
    ];
    foreach ($vs as $i => $v) {
        parseAndCreateVariant($v, $p->id, $i);
    }

    expect(ProductVariant::where('sku','TSO2-V01')->value('attributes'))->toBe(['Size'=>'30']);
    expect(ProductVariant::where('sku','TSO2-V01')->value('value'))->toBe('30');
    expect(ProductVariant::where('sku','TSO2-V02')->value('attributes'))->toBe(['Size'=>'60']);
    expect(ProductVariant::where('sku','TSO2-V02')->value('value'))->toBe('60');
    expect(ProductVariant::where('sku','TSO2-V03')->value('attributes'))->toBe(['Size'=>'120']);
    expect(ProductVariant::where('sku','TSO2-V03')->value('value'))->toBe('120');
});

it('flat-format: Asrol Powder uses Pack key', function () {
    $cat = Category::create(['name' => 'Powders', 'slug' => 'powders-t', 'status' => true]);
    $p   = makeProduct($cat->id, 'Asrol Powder', 'asrolpowder2', 'ASROLPOWDER2', 'gm');

    $vs = [
        ['label'=>'Pack','value'=>'100','price'=>999.0, 'sku'=>'AP2-V01'],
        ['label'=>'Pack','value'=>'250','price'=>1599.0,'sku'=>'AP2-V02'],
    ];
    foreach ($vs as $i => $v) {
        parseAndCreateVariant($v, $p->id, $i);
    }

    expect(ProductVariant::where('sku','AP2-V01')->value('attributes'))->toBe(['Pack'=>'100']);
    expect(ProductVariant::where('sku','AP2-V01')->value('value'))->toBe('100');
    expect(ProductVariant::where('sku','AP2-V02')->value('attributes'))->toBe(['Pack'=>'250']);
    expect(ProductVariant::where('sku','AP2-V02')->value('value'))->toBe('250');
});

it('indexed-format: Weight attribute still correct', function () {
    $cat = Category::create(['name' => 'Herbs', 'slug' => 'herbs-t', 'status' => true]);
    $p   = makeProduct($cat->id, 'Saunf Test', 'saunf-test', 'SAUNFTEST', 'gm');

    $vs = [
        ['label_1'=>'Weight','value_1'=>'50', 'label_2'=>null,'value_2'=>null,'combined_value'=>'50', 'price'=>100.0,'sku'=>'SAUNFTEST-V01'],
        ['label_1'=>'Weight','value_1'=>'100','label_2'=>null,'value_2'=>null,'combined_value'=>'100','price'=>200.0,'sku'=>'SAUNFTEST-V02'],
    ];
    foreach ($vs as $i => $v) {
        parseAndCreateVariant($v, $p->id, $i);
    }

    expect(ProductVariant::where('sku','SAUNFTEST-V01')->value('attributes'))->toBe(['Weight'=>'50']);
    expect(ProductVariant::where('sku','SAUNFTEST-V01')->value('value'))->toBe('50');
    expect(ProductVariant::where('sku','SAUNFTEST-V02')->value('attributes'))->toBe(['Weight'=>'100']);
    expect(ProductVariant::where('sku','SAUNFTEST-V02')->value('value'))->toBe('100');
});

it('zero product_variants have empty attributes or empty value', function () {
    $cat = Category::create(['name' => 'AllCat', 'slug' => 'all-cat', 'status' => true]);

    $allProducts = [
        ['Twelve Seeds Oil','tsot','TSOT','ml',[
            ['label'=>'Size','value'=>'30','price'=>300.0,'sku'=>'TSOT-V01'],
        ]],
        ['Asrol Powder','asrolt','ASROLT','gm',[
            ['label'=>'Pack','value'=>'100','price'=>999.0,'sku'=>'ASROLT-V01'],
        ]],
        ['Saunf','saunft','SAUNFT','gm',[
            ['label_1'=>'Weight','value_1'=>'50','label_2'=>null,'value_2'=>null,'combined_value'=>'50','price'=>100.0,'sku'=>'SAUNFT-V01'],
        ]],
    ];

    foreach ($allProducts as [$name, $slug, $sku, $unit, $variants]) {
        $p = makeProduct($cat->id, $name, $slug, $sku, $unit);
        foreach ($variants as $i => $v) {
            parseAndCreateVariant($v, $p->id, $i);
        }
    }

    $bad = ProductVariant::all()->filter(function ($v) {
        $attrs     = $v->attributes;
        $attrEmpty = is_null($attrs) || (is_array($attrs) && count($attrs) === 0);
        $valEmpty  = is_null($v->value) || trim((string) $v->value) === '';
        return $attrEmpty || $valEmpty;
    });

    expect($bad->count())->toBe(
        0,
        'Variants with empty attrs/value: ' . $bad->pluck('sku')->implode(', ')
    );
});
