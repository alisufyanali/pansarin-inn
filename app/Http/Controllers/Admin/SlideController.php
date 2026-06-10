<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\SlideRepository;
use App\Http\Requests\Admin\SlideRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SlideController extends Controller
{
    public function __construct(protected SlideRepository $repo)
    {
        $this->middleware('permission:view.slides')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.slides')->only(['create', 'store']);
        $this->middleware('permission:edit.slides')->only(['edit', 'update', 'toggleStatus']);
        $this->middleware('permission:delete.slides')->only(['destroy']);
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/Slides/Index', [
            'stats' => $this->repo->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        try {
            return $this->repo->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Slide getData: '.$e->getMessage());
            return response()->json(['error' => 'Failed to load data', 'data' => [], 'total' => 0], 500);
        }
    }

    public function create()
    {
        return Inertia::render('Admin/Slides/Create');
    }

    public function store(SlideRequest $request)
    {
        try {
            $data = $request->only(['type', 'title', 'subtitle', 'btn_text', 'btn_url', 'sort_order']);
            $data['is_active']  = $request->boolean('is_active', true);
            $data['sort_order'] = (int) $request->input('sort_order', 0);
            $this->repo->store($data, $request->file('image'));
            return to_route('admin.slides.index')->with('success', 'Slide created successfully!');
        } catch (\Exception $e) {
            Log::error('Slide store: '.$e->getMessage());
            return back()->withInput()->with('error', 'Failed to create slide: ' . $e->getMessage());
        }
    }

    public function show(string $id)
    {
        return Inertia::render('Admin/Slides/Show', [
            'slide' => $this->repo->find($id),
        ]);
    }

    public function edit(string $id)
    {
        return Inertia::render('Admin/Slides/Edit', [
            'slide' => $this->repo->find($id),
        ]);
    }

    public function update(SlideRequest $request, string $id)
    {
        try {
            $data = $request->only(['type', 'title', 'subtitle', 'btn_text', 'btn_url', 'sort_order']);
            $data['is_active']  = $request->boolean('is_active', true);
            $data['sort_order'] = (int) $request->input('sort_order', 0);
            $this->repo->update($id, $data, $request->file('image'));
            return to_route('admin.slides.index')->with('success', 'Slide updated successfully!');
        } catch (\Exception $e) {
            Log::error('Slide update: '.$e->getMessage());
            return back()->withInput()->with('error', 'Failed to update slide: ' . $e->getMessage());
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->repo->delete($id);
            return redirect()->route('admin.slides.index')->with('success', 'Slide deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->route('admin.slides.index')->with('error', 'Failed to delete slide.');
        }
    }

    public function toggleStatus(string $id)
    {
        try {
            $this->repo->toggleStatus($id);
            return back()->with('success', 'Slide status updated!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update status.');
        }
    }
}
