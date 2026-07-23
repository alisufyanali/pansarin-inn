<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Jobs\SendOrderConfirmationEmail;
use App\Mail\CustomerWelcomeMail;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
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
        try {
            $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'password' => ['required', 'confirmed', Password::defaults()],
                'phone'    => 'nullable|string|max:20',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        try {
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'phone'    => $request->phone ?? null,
                'username' => \Illuminate\Support\Str::slug($request->name) . '-' . \Illuminate\Support\Str::random(6),
                'status'   => 1,
            ]);

            $user->assignRole('customer');

            // Create customer profile — phone uniqueness handle karo
            $customerPhone = $request->phone ?? null;
            if ($customerPhone && \App\Models\Customer::where('phone', $customerPhone)->exists()) {
                $customerPhone = null;
            }
            \App\Models\Customer::create([
                'user_id'    => $user->id,
                'first_name' => $request->name,
                'email'      => $request->email,
                'phone'      => $customerPhone,
                'status'     => 'active',
            ]);

            // Send welcome email — runs after both User and Customer are persisted.
            // Wrapped in its own try/catch so a mail failure never blocks registration.
            try {
                $customer = $user->customer()->latest()->first();
                if ($customer) {
                    Mail::to($user->email)->queue(new CustomerWelcomeMail($customer));
                }
            } catch (\Throwable $mailEx) {
                Log::error('CustomerWelcomeMail dispatch failed', [
                    'user_id' => $user->id,
                    'error'   => $mailEx->getMessage(),
                ]);
            }

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
        } catch (\Illuminate\Database\QueryException $e) {
            // Duplicate email/username constraint
            if (str_contains($e->getMessage(), 'UNIQUE constraint') || $e->getCode() === '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'An account with this email already exists.',
                    'errors'  => ['email' => ['This email is already registered.']],
                ], 422);
            }
            \Illuminate\Support\Facades\Log::error('API Register DB error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Registration failed. Please try again.'], 500);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('API Register error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Registration failed. Please try again.'], 500);
        }
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
