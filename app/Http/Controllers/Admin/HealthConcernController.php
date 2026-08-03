<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\HealthConcernRepository;
use App\Http\Requests\Admin\HealthConcernRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HealthConcernController extends Controller
{
    protected HealthConcernRepository $repo;

    public function __construct(HealthConcernRepository $repo)
    {
        $this->repo = $repo;

        $this->middleware('permission:view.health-concerns')->only(['index', 'getData']);
        $this->middleware('permission:create.health-concerns')->only(['create', 'store']);
        $this->middleware('permission:edit.health-concerns')->only(['edit', 'update']);
        $this->middleware('permission:delete.health-concerns')->only(['destroy']);
    }

    public function index()
    {
        return Inertia::render('Admin/HealthConcerns/Index', [
            'stats' => $this->repo->getStats(),
        ]);
    }

    public function getData(Request $request)
    {
        return $this->repo->getAllForDataTable($request);
    }

    public function create()
    {
        return Inertia::render('Admin/HealthConcerns/Create');
    }

    public function store(HealthConcernRequest $request)
    {
        try {
            $this->repo->store(
                $request->validated(),
                $request->file('icon')
            );

            return to_route('admin.health-concerns.index')
                ->with('success', 'Health concern created successfully!');

        } catch (\Exception $e) {
            Log::error('HealthConcern creation error: ' . $e->getMessage());

            return back()->withInput()->with('error', 'Failed to create health concern.');
        }
    }

    public function edit(string $id)
    {
        $concern = $this->repo->find($id);

        return Inertia::render('Admin/HealthConcerns/Edit', [
            'concern' => $concern,
        ]);
    }

    public function update(HealthConcernRequest $request, string $id)
    {
        try {
            $this->repo->update(
                $id,
                $request->validated(),
                $request->file('icon')
            );

            return to_route('admin.health-concerns.index')
                ->with('success', 'Health concern updated successfully!');

        } catch (\Exception $e) {
            Log::error('HealthConcern update error: ' . $e->getMessage());

            return back()->withInput()->with('error', 'Failed to update health concern.');
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->repo->delete($id);

            return to_route('admin.health-concerns.index')
                ->with('success', 'Health concern deleted successfully!');

        } catch (\Exception $e) {
            Log::error('HealthConcern deletion error: ' . $e->getMessage());

            return to_route('admin.health-concerns.index')
                ->with('error', 'Failed to delete health concern.');
        }
    }
}
