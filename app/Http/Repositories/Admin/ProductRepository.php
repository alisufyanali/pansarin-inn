<?php

namespace App\Http\Repositories\Admin;

use App\Models\Product;
use App\Models\ProductVariant;
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
            ->select('id', 'name', 'sku', 'price', 'sale_price', 'purchase_price_per_unit',
                     'sale_price_per_unit', 'quantity', 'unit', 'status', 'featured',
                     'category_id', 'thumbnail', 'created_at', 'updated_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('category', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status'))   $query->where('status',   $request->status   === 'active');
        if ($request->filled('featured')) $query->where('featured', $request->featured  === 'yes');

        $query->orderBy($request->get('sortBy', 'created_at'), $request->get('sortOrder', 'desc'));

        $products = $query->paginate($request->get('perPage', 10), ['*'], 'page', $request->get('page', 1));

        return response()->json([
            'data'         => $products->map(fn ($p) => [
                'id'                    => $p->id,
                'name'                  => $p->name,
                'sku'                   => $p->sku,
                'price'                 => $p->price,
                'sale_price'            => $p->sale_price,
                'purchase_price_per_unit' => $p->purchase_price_per_unit,
                'sale_price_per_unit'   => $p->sale_price_per_unit,
                'quantity'              => $p->quantity,
                'unit'                  => $p->unit,
                'status'                => $p->status,
                'featured'              => $p->featured,
                'category_id'           => $p->category_id,
                'category'              => $p->category,
                // ── Thumbnail URL for index table ──
                'thumbnail_url'         => $p->thumbnail
                                            ? Storage::disk('public')->url($p->thumbnail)
                                            : null,
                'created_at'            => $p->created_at,
                'updated_at'            => $p->updated_at,
            ]),
            'total'        => $products->total(),
            'per_page'     => $products->perPage(),
            'current_page' => $products->currentPage(),
            'last_page'    => $products->lastPage(),
        ]);
    }

    public function find($id)
    {
        return Product::findOrFail($id);
    }

    // ── Generate folder path: products/{id}-{slug} ──
    private function productFolder(int $id, string $name): string
    {
        $slug = Str::slug($name);
        return "products/{$id}-{$slug}";
    }

    public function store(array $data, $thumbnailFile = null, $socialImageFile = null, $galleryFiles = [])
    {
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        // ── Store product first to get ID ──
        $variants = $data['variations'] ?? [];
        unset($data['variations'], $data['selected_attributes']);

        // Temporarily store without images to get ID
        $product = Product::create($data);

        $folder = $this->productFolder($product->id, $product->name);

        // ── Now store images with correct folder ──
        if ($thumbnailFile) {
            $product->thumbnail = $thumbnailFile->store($folder, 'public');
            $product->save();
        }

        if ($socialImageFile) {
            $product->social_image = $socialImageFile->store("{$folder}/social", 'public');
            $product->save();
        }

        if (!empty($galleryFiles)) {
            $galleryPaths = [];
            foreach ($galleryFiles as $file) {
                $galleryPaths[] = $file->store("{$folder}/gallery", 'public');
            }
            $product->gallery = $galleryPaths;
            $product->save();
        }

        // ── Create variants ──
        if (!empty($variants)) {
            foreach ($variants as $index => $variant) {
                ProductVariant::create([
                    'product_id'         => $product->id,
                    'sku'                => $product->sku . '-V' . str_pad($index + 1, 2, '0', STR_PAD_LEFT),
                    'attribute_value_id' => 1,
                    'value'              => $variant['combination'] ?? '',
                    'attributes'         => $variant['attributes'] ?? [],
                    'additional'         => 0,
                    'price'              => $variant['sale_price'] ?? 0,
                    'sale_price'         => null,
                    'stock_alert'        => 5,
                    'is_default'         => ($index === 0),
                    'status'             => true,
                ]);
            }
        }

        return $product;
    }

    public function update($id, array $data, $thumbnailFile = null, $socialImageFile = null, $galleryFiles = [])
    {
        $product = $this->find($id);
        $folder  = $this->productFolder($product->id, $data['name'] ?? $product->name);

        if ($data['name'] !== $product->name && empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $product->id);
        }

        // ── Thumbnail ──
        if ($thumbnailFile) {
            if ($product->thumbnail) Storage::disk('public')->delete($product->thumbnail);
            $data['thumbnail'] = $thumbnailFile->store($folder, 'public');
        } else {
            unset($data['thumbnail']);
        }

        // ── Social Image ──
        if ($socialImageFile) {
            if ($product->social_image) Storage::disk('public')->delete($product->social_image);
            $data['social_image'] = $socialImageFile->store("{$folder}/social", 'public');
        } else {
            unset($data['social_image']);
        }

        // ── Gallery ──
        if (!empty($galleryFiles)) {
            if ($product->gallery && is_array($product->gallery)) {
                foreach ($product->gallery as $old) Storage::disk('public')->delete($old);
            }
            $galleryPaths = [];
            foreach ($galleryFiles as $file) {
                $galleryPaths[] = $file->store("{$folder}/gallery", 'public');
            }
            $data['gallery'] = $galleryPaths;
        } else {
            unset($data['gallery']);
        }

        $variants = $data['variations'] ?? [];
        unset($data['variations'], $data['selected_attributes']);

        $product->update($data);

        // ── Re-create variants ──
        if (!empty($variants)) {
            $product->variants()->delete();
            foreach ($variants as $index => $variant) {
                ProductVariant::create([
                    'product_id'         => $product->id,
                    'sku'                => $product->sku . '-V' . str_pad($index + 1, 2, '0', STR_PAD_LEFT),
                    'attribute_value_id' => 0,
                    'value'              => $variant['combination'] ?? '',
                    'attributes'         => $variant['attributes'] ?? [],
                    'additional'         => 0,
                    'price'              => $variant['sale_price'] ?? 0,
                    'sale_price'         => null,
                    'stock_alert'        => 5,
                    'is_default'         => ($index === 0),
                    'status'             => true,
                ]);
            }
        }

        return $product;
    }

    public function delete($id)
    {
        $product = $this->find($id);

        // ── Delete entire product folder ──
        $folder = $this->productFolder($product->id, $product->name);
        Storage::disk('public')->deleteDirectory($folder);

        return $product->delete();
    }

    public function getStats()
    {
        return [
            'total'    => Product::count(),
            'active'   => Product::where('status', true)->count(),
            'featured' => Product::where('featured', true)->count(),
            'onSale'   => Product::whereNotNull('sale_price')
                            ->whereColumn('sale_price', '<', 'price')
                            ->where('sale_price', '>', 0)->count(),
        ];
    }

    private function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug     = $baseSlug;
        $counter  = 1;

        while (
            Product::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter++;
        }

        return $slug;
    }
}