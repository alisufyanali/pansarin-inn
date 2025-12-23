<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Organize permissions by category
     */
    private function getOrganizedPermissions()
    {
        $permissions = Permission::all(['id', 'name']);
        
        $organized = [];
        foreach ($permissions as $permission) {
            // Extract category from permission name (e.g., "view.users" -> "users")
            $parts = explode('.', $permission->name);
            $category = ucfirst(end($parts)); // Get last part and capitalize
            
            // Map category names to readable format
            $categoryMap = [
                'Users' => 'User Management',
                'Roles' => 'Role Management',
                'Products' => 'Product Management',
                'Categories' => 'Category Management',
                'Variants' => 'Variant Management',
            ];
            
            $categoryLabel = $categoryMap[$category] ?? ucfirst($category) . ' Management';
            
            if (!isset($organized[$categoryLabel])) {
                $organized[$categoryLabel] = [];
            }
            
            $organized[$categoryLabel][] = $permission;
        }
        
        // Convert to array format expected by frontend
        return array_map(function ($category, $perms) {
            return [
                'category' => $category,
                'permissions' => $perms
            ];
        }, array_keys($organized), array_values($organized));
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Calculate stats from database
        $totalRoles = Role::count();
        $withPermissions = Role::has('permissions')->count();
        $totalPermissions = Permission::count();
        
        // Get roles with permission counts
        $rolesWithCounts = Role::withCount('permissions')->get();
        $avgPermissions = $totalRoles > 0 
            ? round($rolesWithCounts->sum('permissions_count') / $totalRoles) 
            : 0;

        return Inertia::render('Admin/Roles/Index', [
            'roles' => Role::with('permissions')->get(),
            'stats' => [
                'total' => $totalRoles,
                'withPermissions' => $withPermissions,
                'totalPermissions' => $totalPermissions,
                'avgPermissions' => $avgPermissions,
            ],
        ]);
    }

    /**
     * Get paginated data for DataTable (AJAX endpoint)
     */
    public function getData(Request $request)
    {
        $query = Role::with('permissions')->latest();
        
        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('permissions', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Sorting
        $sortBy = $request->get('sortBy', 'id');
        $sortOrder = $request->get('sortOrder', 'desc');
        
        if ($sortBy === 'permissions_count') {
            $query->withCount('permissions')
                  ->orderBy('permissions_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }
        
        // Pagination
        $perPage = $request->get('perPage', 10);
        $roles = $query->paginate($perPage);
        
        return response()->json([
            'data' => $roles->items(),
            'total' => $roles->total(),
            'per_page' => $roles->perPage(),
            'current_page' => $roles->currentPage(),
            'last_page' => $roles->lastPage(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $allPermissions = Permission::all(['id', 'name'])->toArray();
        
        return Inertia::render('Admin/Roles/Create', [
            'permissions' => $allPermissions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'permission' => 'required|array|min:1'
        ]);
        
        $role = Role::create(['name' => $request->name]);
        $role->syncPermissions($request->permission);
        
        return to_route('roles.index')->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return Inertia::render('Admin/Roles/Show', [
            'role' => $role,
            'rolepermissions' => $role->permissions->pluck('name')->toArray(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        $allPermissions = Permission::all(['id', 'name'])->toArray();
        
        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role,
            'rolepermissions' => $role->permissions->pluck('name')->toArray(),
            'permissions' => $allPermissions
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,'.$id,
            'permission' => 'required|array|min:1'
        ]);
        
        $role = Role::findOrFail($id);
        $role->name = $request->name;
        $role->save();
        $role->syncPermissions($request->permission);
        
        return to_route('roles.index')->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();
        
        return to_route('roles.index')->with('success', 'Role deleted successfully.');
    }
}