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
            'roles' => Role::all()
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
        ]);

        Role::create(['name' => $request->name]);

        return redirect()->route('admin.roles.index')->with([
            'message' => 'Role created successfully.',
            'alert-type' => 'success',
    ]);
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {
        Role::find($id)->delete();
    }
}