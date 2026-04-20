<?php

namespace App\Http\Repositories\Admin;

use App\Models\Slide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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

        $slides = $query->paginate($request->get('perPage', 10));

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
            $data['image'] = $imageFile->store('slides', 'public');
        }
        return Slide::create($data);
    }

    public function update($id, array $data, $imageFile = null): Slide
    {
        $slide = $this->find($id);

        if ($imageFile) {
            // Delete old image
            if ($slide->image) Storage::disk('public')->delete($slide->image);
            $data['image'] = $imageFile->store('slides', 'public');
        }

        $slide->update($data);
        return $slide;
    }

    public function delete($id): bool
    {
        $slide = $this->find($id);
        if ($slide->image) Storage::disk('public')->delete($slide->image);
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
}
