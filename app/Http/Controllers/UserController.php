<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct()
    {
        // Permissions check
        $this->middleware('permission:create.users')->only(['create', 'store']);
        $this->middleware('permission:edit.users')->only(['edit', 'update']);
        $this->middleware('permission:delete.users')->only(['destroy']);
    }

    // List users with stats
    public function index()
    {
        $totalUsers = User::count();

        $admins = Role::where('name', 'admin')->exists() ? User::role('admin')->count() : 0;
        $vendors = Role::where('name', 'vendor')->exists() ? User::role('vendor')->count() : 0;
        $customers = Role::where('name', 'customer')->exists() ? User::role('customer')->count() : 0;

        return Inertia::render('Users/Index', [
            'users' => User::with('roles')->get(),
            'stats' => [
                'total' => $totalUsers,
                'admins' => $admins,
                'vendors' => $vendors,
                'customers' => $customers,
            ],
        ]);
    }

    // API: Data for table (search/sort/paginate)
    public function getData(Request $request)
    {
        $query = User::with('roles')->latest();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('roles', function ($q) use ($search) {
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

    // Show create form
    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    // Store new user
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'username' => $request->username ?? null,
            'status' => $request->status ?? 1,
        ]);

        // Assign multiple roles via Spatie
        $user->syncRoles($request->roles);

        return to_route('admin.users.index')->with('success', 'User successfully created!');
    }

    // Show user details
    public function show(string $id)
    {
        $user = User::with('roles')->findOrFail($id);

        return Inertia::render('Users/Show', [
            'user' => $user
        ]);
    }

    // Show edit form
    public function edit(string $id)
    {
        $user = User::with('roles')->findOrFail($id);

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all(['id', 'name']),
            'userRoles' => $user->roles->pluck('name')->toArray(),
        ]);
    }

    // Update user
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$id,
            'password' => 'nullable|string|min:8|confirmed',
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user = User::findOrFail($id);
        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone ?? $user->phone;
        $user->username = $request->username ?? $user->username;
        $user->status = $request->status ?? $user->status;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        // Update roles
        $user->syncRoles($request->roles);

        return to_route('admin.users.index')->with('success', 'User successfully updated!');
    }

    // Delete user
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return to_route('admin.users.index')->with('success', 'User successfully deleted!');
    }
}
