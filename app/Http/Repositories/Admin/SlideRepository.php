<?php

namespace App\Http\Repositories\Admin;

use App\Models\Slide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SlideRepository
{
    public function getAllForDataTable(Request $request)
    {
        $query = Slide::latest('sort_order');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('subtitle', 'like', "%{$s}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $slides = $query->paginate(min((int) $request->get('perPage', 10), 100));

        return response()->json([
            'data'         => $slides->items(),
            'total'        => $slides->total(),
            'per_page'     => $slides->perPage(),
            'current_page' => $slides->currentPage(),
            'last_page'    => $slides->lastPage(),
        ]);
    }

    public function find($id): Slide
    {
        return Slide::findOrFail($id);
    }

    public function store(array $data, $imageFile = null): Slide
    {
        if ($imageFile) {
            $data['image'] = $this->moveUploadedFile($imageFile, 'slides');
        }
        return Slide::create($data);
    }

    public function update($id, array $data, $imageFile = null): Slide
    {
        $slide = $this->find($id);

        if ($imageFile) {
            // Upload new file first — only delete old one after success
            $newPath = $this->moveUploadedFile($imageFile, 'slides');
            if ($slide->image) {
                $this->deleteUploadedFile($slide->image);
            }
            $data['image'] = $newPath;
        }

        $slide->update($data);
        return $slide;
    }

    public function delete($id): bool
    {
        $slide = $this->find($id);
        if ($slide->image) {
            $this->deleteUploadedFile($slide->image);
        }
        return $slide->delete();
    }

    public function toggleStatus($id): Slide
    {
        $slide = $this->find($id);
        $slide->update(['is_active' => !$slide->is_active]);
        return $slide;
    }

    public function getStats(): array
    {
        return [
            'total'   => Slide::count(),
            'desktop' => Slide::where('type', 'desktop')->count(),
            'mobile'  => Slide::where('type', 'mobile')->count(),
            'active'  => Slide::where('is_active', true)->count(),
        ];
    }

    // ── Native-PHP file helpers (bypasses Flysystem / finfo) ──────

    /**
     * Move an UploadedFile to public/storage/{folder} using native PHP.
     * Returns the relative path stored in the database, e.g. "slides/abc123.jpg".
     */
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

    /**
     * Delete a file stored via moveUploadedFile().
     */
    private function deleteUploadedFile(string $relativePath): void
    {
        $fullPath = public_path('storage/' . $relativePath);

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }
}
