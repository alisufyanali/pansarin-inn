<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\CityRepository;
use App\Http\Requests\Admin\CityRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CityController extends Controller
{
    protected $cityRepository;

    public function __construct(CityRepository $cityRepository)
    {
        $this->cityRepository = $cityRepository;
        $this->middleware('permission:create.cities')->only(['create', 'store']);
        $this->middleware('permission:edit.cities')->only(['edit', 'update']);
        $this->middleware('permission:delete.cities')->only(['destroy']);
        $this->middleware('permission:view.cities')->only(['index', 'show', 'getData']);
    }

    public function index(Request $request)
    {
        try {
            $stats = $this->cityRepository->getStats();

            return Inertia::render('Admin/Cities/Index', [
                'userRole' => $request->user()->role ?? 'admin',
                'stats'    => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('City index error: '.$e->getMessage());

            return back()->with('error', 'Failed to load cities.');
        }
    }

    public function getData(Request $request)
    {
        try {
            return $this->cityRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('City getData error: '.$e->getMessage());

            return response()->json([
                'error'   => 'Failed to load data',
                'message' => $e->getMessage(),
                'data'    => [],
                'total'   => 0,
            ], 500);
        }
    }

    public function create()
    {
        try {
            return Inertia::render('Admin/Cities/Create', [
                'provinces' => $this->provinces(),
            ]);
        } catch (\Exception $e) {
            Log::error('City create error: '.$e->getMessage());

            return redirect()->route('admin.cities.index')
                ->with('error', 'Failed to load create form.');
        }
    }

    public function store(CityRequest $request)
    {
        try {
            $this->cityRepository->store($request->validated());

            return to_route('admin.cities.index')->with('success', 'City successfully created!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('City store error: '.$e->getMessage());

            return back()->withInput()->with('error', 'Failed to create city.');
        }
    }

    public function show(string $id)
    {
        try {
            $city = $this->cityRepository->find($id);

            return Inertia::render('Admin/Cities/Show', [
                'city'      => $city,
                'provinces' => $this->provinces(),
            ]);
        } catch (\Exception $e) {
            Log::error('City show error: '.$e->getMessage());

            return redirect()->route('admin.cities.index')
                ->with('error', 'Failed to load city.');
        }
    }

    public function edit(string $id)
    {
        try {
            $city = $this->cityRepository->find($id);

            return Inertia::render('Admin/Cities/Edit', [
                'city'      => $city,
                'provinces' => $this->provinces(),
            ]);
        } catch (\Exception $e) {
            Log::error('City edit error: '.$e->getMessage());

            return redirect()->route('admin.cities.index')
                ->with('error', 'Failed to load city.');
        }
    }

    public function update(CityRequest $request, string $id)
    {
        try {
            $this->cityRepository->update($id, $request->validated());

            return to_route('admin.cities.index')->with('success', 'City successfully updated!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('City update error: '.$e->getMessage());

            return back()->withInput()->with('error', 'Failed to update city.');
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->cityRepository->delete($id);

            return redirect()->route('admin.cities.index')
                ->with('success', 'City successfully deleted!');
        } catch (\Exception $e) {
            Log::error('City deletion error: '.$e->getMessage());

            return redirect()->route('admin.cities.index')
                ->with('error', 'Failed to delete city.');
        }
    }

    public function bulkDelete(Request $request)
    {
        try {
            $request->validate([
                'ids'   => 'required|array',
                'ids.*' => 'exists:cities,id',
            ]);

            $count = $this->cityRepository->bulkDelete($request->ids);

            return back()->with('success', $count.' cities deleted successfully!');
        } catch (\Exception $e) {
            Log::error('City bulk delete error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete cities.');
        }
    }

    private function provinces(): array
    {
        return [
            ['value' => 'sindh',        'label' => 'Sindh'],
            ['value' => 'punjab',       'label' => 'Punjab'],
            ['value' => 'balochistan',  'label' => 'Balochistan'],
            ['value' => 'kpk',          'label' => 'KPK'],
            ['value' => 'gilgit',       'label' => 'Gilgit-Baltistan'],
            ['value' => 'azad_kashmir', 'label' => 'Azad Kashmir'],
        ];
    }
}
