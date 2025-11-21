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
     * Display a listing of the resource.
     */
    public function index() {

        return Inertia::render('Admin/Roles/Index', [
            'roles' => Role::with('permissions')->get()
        ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Roles/Create', [
            'permissions' => Permission::all(['id', 'name'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'permission' => 'required|array|min:1'
        ]);
        $role = Role::create(['name' => $request->name]);
        $role->syncPermissions($request->permission);
        return to_route('roles.index')->with([
            'message' => 'Role created successfully.',
            'alert-type' => 'success',
        ]);
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
        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role,
            'rolepermissions' => $role->permissions->pluck('name')->toArray(),
            'permissions' => Permission::all(['id', 'name'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // dd($request->all());
        $request->validate([
            'name' => 'required|unique:roles,name,'.$id,
            'permission' => 'required|array|min:1'
        ]);
        $role = Role::findOrFail($id);
        $role->name = $request->name;
        $role->save();
        $role->syncPermissions($request->permission);
        return to_route('roles.index')->with([
            'message' => 'Role updated successfully.',
            'alert-type' => 'success',
        ]);
    } 

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {
        $role = Role::findOrFail($id);
        $role->delete();
        return to_route('roles.index')->with([
            'message' => 'Role deleted successfully.',
            'alert-type' => 'success',
        ]);
    }
}