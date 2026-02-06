<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function __construct()
    {
        // Enforce permissions on controller actions so backend blocks unauthorized requests
        $this->middleware('permission:create.users')->only(['create', 'store']);
        $this->middleware('permission:edit.users')->only(['edit', 'update']);
        $this->middleware('permission:delete.users')->only(['destroy']);
    }

    public function index()
    {
        // Calculate stats from database
        $totalUsers = User::count();
        
        // Check if roles exist before counting
        $admins = Role::where('name', 'admin')->exists() 
            ? User::role('admin')->count() 
            : 0;
        
        $vendors = Role::where('name', 'vendor')->exists() 
            ? User::role('vendor')->count() 
            : 0;
        
        $customers = Role::where('name', 'customer')->exists() 
            ? User::role('customer')->count() 
            : 0;
        
        return Inertia::render('admin/Users/Index', [
            'users' => User::with('roles')->get(),
            'stats' => [
                'total' => $totalUsers,
                'admins' => $admins,
                'vendors' => $vendors,
                'customers' => $customers,
            ],
        ]);
    }

    public function getData(Request $request)
    {
        $query = User::with('roles')->latest();
        
        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('roles', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Sorting
        $sortBy = $request->get('sortBy', 'id');
        $sortOrder = $request->get('sortOrder', 'desc');
        
        $query->orderBy($sortBy, $sortOrder);
        
        // Pagination
        $perPage = $request->get('perPage', 10);
        $users = $query->paginate($perPage);
        
        return response()->json([
            'data' => $users->items(),
            'total' => $users->total(),
            'per_page' => $users->perPage(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|exists:roles,name',
        ]);

        $roleName = strtolower($request->role);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
        ]);

        // assign selected role (role name expected)
        if ($request->filled('role')) {
            $user->syncRoles([$request->role]);
        }

        return to_route('admin/users.index')->with('success', 'User successfully created!');
    }

    public function show(string $id)
    {
        $user = User::with('roles')->findOrFail($id);

        return Inertia::render('Users/Show', [
            'user' => $user
        ]);
    }

    public function edit(string $id)
    {
        $user = User::with('roles')->findOrFail($id);
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all(['id', 'name']),
            'userRoles' => $user->roles->pluck('name')->toArray(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$id,
            'password' => 'nullable|string|min:8',
            'password_confirmation' => 'nullable|string|min:8',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = User::findOrFail($id);
        $user->name = $request->name;
        $user->email = $request->email;

        // Role column update karein (Migration wala column)
        if ($request->filled('role')) {
            $user->role = $request->role; 
        }

        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
        }
        $user->save();

        // Spatie sync
        if ($request->filled('role')) {
            $user->syncRoles([$request->role]);
        }

        return to_route('admin/users.index')->with('success', 'User successfully updated!');
    }

    public function destroy(string $id)
    {
        User::destroy($id);
        return to_route('users.index')->with('success', 'User successfully deleted!');
    }
}