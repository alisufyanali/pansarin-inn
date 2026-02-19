<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\PermissionRepository;
use App\Http\Requests\Admin\PermissionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PermissionController extends Controller
{
    protected $permissionRepository;

    public function __construct(PermissionRepository $permissionRepository)
    {
        $this->permissionRepository = $permissionRepository;
        $this->middleware('permission:view.permissions')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.permissions')->only(['create', 'store']);
        $this->middleware('permission:edit.permissions')->only(['edit', 'update']);
        $this->middleware('permission:delete.permissions')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stats = $this->permissionRepository->getStats();

        return Inertia::render('Admin/Permissions/Index', [
            'stats' => $stats,
        ]);
    }

    /**
     * Get paginated data for DataTable (AJAX endpoint)
     */
    public function getData(Request $request)
    {
        try {
            return $this->permissionRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Permissions getData error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to load data',
                'message' => $e->getMessage(),
                'data' => [],
                'total' => 0,
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Permissions/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PermissionRequest $request)
    {
        try {
            $validated = $request->validated();
            
            // Set default guard_name if not provided
            if (!isset($validated['guard_name'])) {
                $validated['guard_name'] = 'web';
            }

            $this->permissionRepository->store($validated);

            return redirect()
                ->route('admin.permissions.index')
                ->with('success', 'Permission created successfully!');
        } catch (\Exception $e) {
            Log::error('Permission creation error: ' . $e->getMessage());
            return back()
                ->withInput()
                ->with('error', 'Failed to create permission.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $permission = $this->permissionRepository->find($id);

        return Inertia::render('Admin/Permissions/Show', [
            'permission' => $permission
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $permission = $this->permissionRepository->find($id);

        return Inertia::render('Admin/Permissions/Edit', [
            'permission' => $permission,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PermissionRequest $request, string $id)
    {
        try {
            $validated = $request->validated();

            $this->permissionRepository->update($id, $validated);

            return redirect()
                ->route('admin.permissions.index')
                ->with('success', 'Permission updated successfully!');
        } catch (\Exception $e) {
            Log::error('Permission update error: ' . $e->getMessage());
            return back()
                ->withInput()
                ->with('error', 'Failed to update permission.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->permissionRepository->delete($id);
            
            return redirect()
                ->route('admin.permissions.index')
                ->with('success', 'Permission deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Permission deletion error: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete permission.');
        }
    }
}
