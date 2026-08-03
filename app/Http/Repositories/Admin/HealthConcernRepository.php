<?php

namespace App\Http\Repositories\Admin;

use App\Models\HealthConcern;
use Illuminate\Support\Str;

class HealthConcernRepository
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return HealthConcern::orderBy('sort_order')->orderBy('name')->get();
    }

    public function getAllActive(): \Illuminate\Database\Eloquent\Collection
    {
        return HealthConcern::active()->orderBy('sort_order')->orderBy('name')->get();
    }

    public function getAllForDataTable($request): \Illuminate\Http\JsonResponse
    {
        $query = HealthConcern::select('id', 'name', 'slug', 'icon', 'status', 'sort_order', 'created_at', 'updated_at');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status === 'active');
        }

        // Sorting
        $sortBy    = $request->get('sortBy', 'sort_order');
        $sortOrder = $request->get('sortOrder', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min((int) $request->get('perPage', 10), 100);
        $page    = $request->get('page', 1);

        $items = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data'         => $items->map(fn ($c) => [
                'id'         => $c->id,
                'name'       => $c->name,
                'slug'       => $c->slug,
                'icon'       => $c->icon,
                'icon_url'   => $c->icon ? asset('storage/' . $c->icon) : null,
                'status'     => $c->status,
                'sort_order' => $c->sort_order,
                'created_at' => $c->created_at,
                'updated_at' => $c->updated_at,
            ]),
            'total'        => $items->total(),
            'per_page'     => $items->perPage(),
            'current_page' => $items->currentPage(),
            'last_page'    => $items->lastPage(),
        ]);
    }

    public function find(int|string $id): HealthConcern
    {
        return HealthConcern::findOrFail($id);
    }

    public function store(array $data, $iconFile = null): HealthConcern
    {
        $data['slug'] = $this->generateUniqueSlug($data['name']);

        if ($iconFile) {
            $data['icon'] = $this->moveUploadedFile($iconFile, 'health-concerns');
        }

        return HealthConcern::create($data);
    }

    public function update(int|string $id, array $data, $iconFile = null): HealthConcern
    {
        $concern = $this->find($id);

        if ($data['name'] !== $concern->name) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $concern->id);
        }

        if ($iconFile) {
            if ($concern->icon) {
                $this->deleteUploadedFile($concern->icon);
            }
            $data['icon'] = $this->moveUploadedFile($iconFile, 'health-concerns');
        } else {
            unset($data['icon']);
        }

        $concern->update($data);

        return $concern;
    }

    public function delete(int|string $id): bool
    {
        $concern = $this->find($id);

        if ($concern->icon) {
            $this->deleteUploadedFile($concern->icon);
        }

        return $concern->delete();
    }

    public function getStats(): array
    {
        return [
            'total'  => HealthConcern::count(),
            'active' => HealthConcern::where('status', true)->count(),
        ];
    }

    // ── Private helpers ────────────────────────────────────────────

    private function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $base    = Str::slug($name);
        $slug    = $base;
        $counter = 1;

        while (
            HealthConcern::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = $base . '-' . $counter++;
        }

        return $slug;
    }

    private function moveUploadedFile($file, string $folder): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename  = Str::uuid() . '.' . $extension;
        $directory = public_path('storage/' . $folder);

        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $file->move($directory, $filename);

        return $folder . '/' . $filename;
    }

    private function deleteUploadedFile(string $relativePath): void
    {
        $fullPath = public_path('storage/' . $relativePath);

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }
}
