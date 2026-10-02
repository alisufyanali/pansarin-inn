<?php

use App\Console\Commands\BackfillOtherNames;
use App\Models\Category;
use App\Models\Product;

it('extracts the other name from the old-site overview line', function () {
    expect(BackfillOtherNames::extractOtherName('Scientific Name: Linum usitatissimum Urdu: السی,ایلسی Other Names: Lin Seed , Barz Etc'))
        ->toBe('Lin Seed , Barz Etc')
        ->and(BackfillOtherNames::extractOtherName("Other Name: Saunf,Sonf\nBenefits: good"))->toBe('Saunf,Sonf')
        // Empty value followed straight by the Urdu heading
        ->and(BackfillOtherNames::extractOtherName('Other Names: Urdu Name :کاجو'))->toBeNull()
        ->and(BackfillOtherNames::extractOtherName('OverviewLong Pepper'))->toBeNull();
});

it('fills only empty other names, matched by slug', function () {
    $category = Category::create(['name' => 'Herbs', 'slug' => 'herbs', 'status' => true]);
    $make = fn (string $slug, ?string $other) => Product::create([
        'category_id' => $category->id, 'name' => $slug, 'slug' => $slug, 'sku' => strtoupper($slug),
        'status' => true, 'other_name' => $other,
    ]);

    $alsi  = $make('alsi', null);
    $saunf = $make('fennelseeds', 'Admin typed this');

    $this->artisan('backfill:other-names --dry-run')->assertSuccessful();
    expect($alsi->fresh()->other_name)->toBeNull();

    $this->artisan('backfill:other-names')->assertSuccessful();
    expect($alsi->fresh()->other_name)->toBe('Lin Seed , Barz Etc')
        ->and($saunf->fresh()->other_name)->toBe('Admin typed this');
});
