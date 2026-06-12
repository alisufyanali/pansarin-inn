<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthApiController extends Controller
{
    // POST /api/login
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data'    => [
                'token' => $token,
                'user'  => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
            ],
        ]);
    }

    // POST /api/register
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone'    => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone ?? null,
            'username' => \Illuminate\Support\Str::slug($request->name) . '-' . rand(1000, 9999),
            'status'   => 1,
        ]);

        $user->assignRole('customer');

        // Create customer profile
        \App\Models\Customer::create([
            'user_id'    => $user->id,
            'first_name' => $request->name,
            'email'      => $request->email,
            'phone'      => $request->phone ?? null,
            'status'     => 'active',
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'data'    => [
                'token' => $token,
                'user'  => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
            ],
        ], 201);
    }

    // POST /api/logout  (auth:sanctum)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    // GET /api/user  (auth:sanctum)
    public function user(Request $request)
    {
        $user     = $request->user();
        $customer = $user->customer;

        return response()->json([
            'success' => true,
            'data'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'phone'    => $user->phone,
                'roles'    => $user->getRoleNames(),
                'customer' => $customer ? [
                    'id'         => $customer->id,
                    'first_name' => $customer->first_name,
                    'last_name'  => $customer->last_name,
                    'address'    => $customer->address,
                    'city_id'    => $customer->city_id,
                ] : null,
            ],
        ]);
    }
}
