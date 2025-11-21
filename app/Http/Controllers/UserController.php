<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        // Enforce permissions on controller actions so backend blocks unauthorized requests
        $this->middleware('permission:create.users')->only(['create', 'store']);
        $this->middleware('permission:edit.users')->only(['edit', 'update']);
        $this->middleware('permission:delete.users')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // eager-load roles so the frontend can display user roles
        return Inertia::render('Users/Index',[
            'users' => User::with('roles')->get(),
        ]);
        
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        // assign selected role (role name expected)
        if ($request->filled('role')) {
            $user->syncRoles([$request->role]);
        }

        return to_route('users.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);

        return Inertia::render('Users/Show', [
        'user' => $user
    ]);
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::with('roles')->findOrFail($id);
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all(['id', 'name']),
            'userRoles' => $user->roles->pluck('name')->toArray(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$id,
            'password' => 'nullable|string|min:8',
            'password_confirmation' => 'nullable|string|min:8',
            'role' => 'nullable|string',
        ]);

        $user = User::findOrFail($id);
        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
        }
        $user->save();

        // if role is present in the request, sync it (allow clearing)
        if ($request->filled('role')) {
            $user->syncRoles([$request->role]);
        } elseif ($request->has('role')) {
            // role present but empty -> remove all roles
            $user->syncRoles([]);
        }

        return to_route('users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        User::destroy($id);
        return to_route('users.index');
    }
}