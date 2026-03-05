<?php

namespace App\Http\Repositories\Admin;

use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductRepository
{
    public function getAll()
    {
        return Product::with('category')->latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = Product::with('category:id,name')
            ->select('id', 'name', 'sku', 'price', 'sale_price', 'purchase_price_per_unit', 'sale_price_per_unit', 'quantity', 'unit', 'status', 'featured', 'category_id',  'created_at', 'updated_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhereHas('category', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status === 'active');
        }

        if ($request->filled('featured')) {
            $query->where('featured', $request->featured === 'yes');
        }

        $sortBy = $request->get('sortBy', 'created_at');
        $sortOrder = $request->get('sortOrder', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('perPage', 10);
        $page = $request->get('page', 1);

        $products = $query->paginate($perPage, ['*'], 'page', $page);

        $transformedData = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => $product->price,
                'sale_price' => $product->sale_price,
                'purchase_price_per_unit' => $product->purchase_price_per_unit,
                'sale_price_per_unit' => $product->sale_price_per_unit,
                'quantity' => $product->quantity,
                'unit' => $product->unit,
                'status' => $product->status,
                'featured' => $product->featured,
                'category_id' => $product->category_id,
                'category' => $product->category,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'total' => $products->total(),
            'per_page' => $products->perPage(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
        ]);
    }

    public function find($id)
    {
        return Product::findOrFail($id);
    }

    public function store(array $data, $thumbnailFile = null, $socialImageFile = null, $galleryFiles = [])
    {
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        if ($thumbnailFile) {
            $data['thumbnail'] = $thumbnailFile->store('products', 'public');
        }

        if ($socialImageFile) {
            $data['social_image'] = $socialImageFile->store('products/social', 'public');
        }

        if (! empty($galleryFiles)) {
            $galleryPaths = [];
            foreach ($galleryFiles as $file) {
                $galleryPaths[] = $file->store('products/gallery', 'public');
            }
            $data['gallery'] = $galleryPaths;
        }

        // Extract variants before creating product
        $variants = $data['variations'] ?? [];
        unset($data['variations']);
        unset($data['selected_attributes']);

        $product = Product::create($data);

        // Create variants if provided
        if (!empty($variants)) {
            foreach ($variants as $index => $variant) {
                \App\Models\ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $product->sku . '-V' . str_pad($index + 1, 2, '0', STR_PAD_LEFT),
                    'attribute_value_id' => 1, // Will be updated if needed
                    'value' => $variant['combination'] ?? '',
                    'attributes' => $variant['attributes'] ?? [],
                    'additional' => 0,
                    'price' => $variant['sale_price'] ?? 0,
                    'sale_price' => null,
                    'stock_alert' => 5,
                    'is_default' => ($index === 0),
                    'status' => true,
                ]);
            }
        }

        return $product;
    }

    public function update($id, array $data, $thumbnailFile = null, $socialImageFile = null, $galleryFiles = [])
    {
        $product = $this->find($id);

        if ($data['name'] !== $product->name && empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $product->id);
        }

        // Handle thumbnail
        if ($thumbnailFile) {
            if ($product->thumbnail) {
                Storage::disk('public')->delete($product->thumbnail);
            }
            $data['thumbnail'] = $thumbnailFile->store('products', 'public');
        } else {
            // Don't update thumbnail field if no new image provided
            unset($data['thumbnail']);
        }

        // Handle social image
        if ($socialImageFile) {
            if ($product->social_image) {
                Storage::disk('public')->delete($product->social_image);
            }
            $data['social_image'] = $socialImageFile->store('products/social', 'public');
        } else {
            // Don't update social_image field if no new image provided
            unset($data['social_image']);
        }

        // Handle gallery
        if (! empty($galleryFiles)) {
            // Delete old gallery images
            if ($product->gallery && is_array($product->gallery)) {
                foreach ($product->gallery as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }

            $galleryPaths = [];
            foreach ($galleryFiles as $file) {
                $galleryPaths[] = $file->store('products/gallery', 'public');
            }
            $data['gallery'] = $galleryPaths;
        } else {
            // Don't update gallery field if no new images provided
            unset($data['gallery']);
        }

        // Extract variants before updating product
        $variants = $data['variations'] ?? [];
        unset($data['variations']);
        unset($data['selected_attributes']);

        $product->update($data);

        // Update variants if provided
        if (!empty($variants)) {
            // Delete existing variants
            $product->variants()->delete();

            // Create new variants
            foreach ($variants as $index => $variant) {
                \App\Models\ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $product->sku . '-V' . str_pad($index + 1, 2, '0', STR_PAD_LEFT),
                    'attribute_value_id' => 0,
                    'value' => $variant['combination'] ?? '',
                    'attributes' => $variant['attributes'] ?? [],
                    'additional' => 0,
                    'price' => $variant['sale_price'] ?? 0,
                    'sale_price' => null,
                    'stock_alert' => 5,
                    'is_default' => ($index === 0),
                    'status' => true,
                ]);
            }
        }

        return $product;
    }

    public function delete($id)
    {
        $product = $this->find($id);

        if ($product->thumbnail) {
            Storage::disk('public')->delete($product->thumbnail);
        }

        if ($product->social_image) {
            Storage::disk('public')->delete($product->social_image);
        }

        if ($product->gallery && is_array($product->gallery)) {
            foreach ($product->gallery as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        return $product->delete();
    }

    public function getStats()
    {
        return [
            'total' => Product::count(),
            'active' => Product::where('status', true)->count(),
            'featured' => Product::where('featured', true)->count(),
            'onSale' => Product::whereNotNull('sale_price')
                ->whereColumn('sale_price', '<', 'price')
                ->where('sale_price', '>', 0)
                ->count(),
        ];
    }

    private function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (
            Product::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
