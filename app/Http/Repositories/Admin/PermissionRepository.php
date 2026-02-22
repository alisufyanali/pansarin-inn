<?php

namespace App\Http\Repositories\Admin;

use Spatie\Permission\Models\Permission;

class PermissionRepository
{
    public function getAll()
    {
        return Permission::latest()->get();
    }

    public function getAllForDataTable($request)
    {
        $query = Permission::select('id', 'name', 'guard_name', 'created_at', 'updated_at');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Sorting
        $sortBy = $request->get('sortBy', 'created_at');
        $sortOrder = $request->get('sortOrder', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('perPage', 10);
        $page = $request->get('page', 1);

        $permissions = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform data
        $transformedData = $permissions->map(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'guard_name' => $permission->guard_name,
                'created_at' => $permission->created_at,
                'updated_at' => $permission->updated_at,
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'total' => $permissions->total(),
            'per_page' => $permissions->perPage(),
            'current_page' => $permissions->currentPage(),
            'last_page' => $permissions->lastPage(),
        ]);
    }

    public function find($id)
    {
        return Permission::findOrFail($id);
    }

    public function store(array $data)
    {
        return Permission::create($data);
    }

    public function update($id, array $data)
    {
        $permission = $this->find($id);
        $permission->update($data);

        return $permission;
    }

    public function delete($id)
    {
        $permission = $this->find($id);

        return $permission->delete();
    }

    public function getStats()
    {
        $permissions = Permission::all();

        // Group by action type
        $viewCount = $permissions->filter(fn ($p) => str_starts_with($p->name, 'view.'))->count();
        $createCount = $permissions->filter(fn ($p) => str_starts_with($p->name, 'create.'))->count();
        $editCount = $permissions->filter(fn ($p) => str_starts_with($p->name, 'edit.'))->count();
        $deleteCount = $permissions->filter(fn ($p) => str_starts_with($p->name, 'delete.'))->count();

        return [
            'total' => $permissions->count(),
            'view' => $viewCount,
            'create' => $createCount,
            'edit' => $editCount,
            'delete' => $deleteCount,
        ];
    }
}
