<?php

use App\Http\Repositories\Admin\OrderRepository;
use App\Http\Repositories\Admin\SaleRepository;
use App\Http\Requests\Admin\OrderRequest;
use App\Http\Requests\Admin\SaleRequest;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\ProductStock;
use Illuminate\Support\Facades\Validator;

beforeEach(function () {
    \App\Models\CustomerGroup::create(['name' => 'General', 'discount_percentage' => 0, 'is_default' => true]);

    $category = \App\Models\Category::create(['name' => 'Test', 'slug' => 'test', 'status' => true]);
    $product  = \App\Models\Product::create([
        'category_id' => $category->id, 'name' => 'Test Herb', 'slug' => 'test-herb',
        'sku' => 'TH-001', 'unit' => 'gm', 'status' => true,
    ]);
    $variant = \App\Models\ProductVariant::create([
        'product_id' => $product->id, 'sku' => 'TH-001-100', 'value' => '100 gm',
        'attributes' => ['Weight' => '100 gm'], 'price' => 100, 'sale_price' => null,
        'is_default' => true, 'status' => true,
    ]);
    ProductStock::create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 10]);

    $this->productId = $product->id;
    $this->variantId = $variant->id;
    $this->customer  = Customer::create(['first_name' => 'Rasool', 'last_name' => 'Bux', 'phone' => '923363222551']);
});

function customOrderData(array $items): array
{
    return [
        'customer_id' => test()->customer->id, 'items' => $items,
        'shipping_charges' => 250, 'status' => 'pending', 'payment_status' => 'unpaid',
    ];
}

it('saves a custom item next to a catalog product, without touching stock for it', function () {
    $order = app(OrderRepository::class)->store(customOrderData([
        ['product_id' => $this->productId, 'product_variant_id' => $this->variantId, 'quantity' => 2, 'price' => 100],
        ['custom_name' => 'Eye Dropper', 'custom_variant' => '10 ml', 'quantity' => 3, 'price' => 50, 'discount' => 10],
    ]));

    $custom = $order->items->firstWhere('product_id', null);
    expect($custom->meta)->toMatchArray(['product_name' => 'Eye Dropper', 'variant_name' => '10 ml', 'custom' => true])
        ->and($custom->subtotal)->toBe(140.0)
        ->and((float) $order->fresh()->subtotal)->toBe(340.0) // line subtotals are after their discount
        ->and(Inventory::count())->toBe(1) // only the catalog line moved stock
        ->and((float) ProductStock::where('product_variant_id', $this->variantId)->value('quantity'))->toBe(8.0);
});

it('edits, cancels and deletes an order with a custom item without stock errors', function () {
    $repo  = app(OrderRepository::class);
    $order = $repo->store(customOrderData([
        ['custom_name' => 'Eye Dropper', 'quantity' => 1, 'price' => 50],
    ]));

    $order = $repo->update($order->id, customOrderData([
        ['custom_name' => 'Eye Dropper (glass)', 'quantity' => 2, 'price' => 60],
    ]) + ['city_id' => null]);
    expect($order->items->sole()->meta['product_name'])->toBe('Eye Dropper (glass)');

    $order->update(['status' => 'cancelled']);
    $repo->delete($order->id);
    expect(Inventory::count())->toBe(0);
});

it('saves a custom item on a sale', function () {
    $order = app(OrderRepository::class)->store(customOrderData([['custom_name' => 'Eye Dropper', 'quantity' => 1, 'price' => 50]]));

    $sale = app(SaleRepository::class)->store([
        'order_id' => $order->id, 'customer_id' => $this->customer->id, 'delivery_status' => 'pending', 'payment_status' => 'unpaid',
        'items' => [['custom_name' => 'Eye Dropper', 'quantity' => 1, 'price' => 50]],
    ]);

    expect($sale->items->sole()->product_id)->toBeNull()
        ->and($sale->items->sole()->meta['product_name'])->toBe('Eye Dropper');
});

it('needs a product or a custom name on every line', function (string $request) {
    $rules = (new $request)->rules();
    $base  = ['customer_id' => $this->customer->id, 'city_id' => null];

    $line = fn (array $l) => Validator::make($base + ['items' => [$l + ['quantity' => 1, 'price' => 10]]], $rules)->errors();

    expect($line([])->has('items.0.product_id'))->toBeTrue()
        ->and($line(['custom_name' => 'Eye Dropper'])->has('items.0.product_id'))->toBeFalse()
        ->and($line(['custom_name' => 'Eye Dropper'])->has('items.0.custom_name'))->toBeFalse()
        ->and($line(['product_id' => $this->productId])->has('items.0.custom_name'))->toBeFalse();
})->with(['order' => [OrderRequest::class], 'sale' => [SaleRequest::class]]);
