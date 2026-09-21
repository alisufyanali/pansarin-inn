<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Helpers\PhoneHelper;
use App\Mail\CustomerWelcomeMail;
use App\Models\User;
use App\Services\CustomerIdentityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthApiController extends Controller
{
    public function __construct(protected CustomerIdentityService $identity) {}

    // POST /api/login — customer API: phone (username) + password only
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required_without:phone|string|max:30',
            'phone'    => 'required_without:login|string|max:30',
            'password' => 'required|string',
        ]);

        $rawLogin = trim((string) ($request->input('login') ?? $request->input('phone')));
        $normalized = PhoneHelper::normalize($rawLogin);

        if (! $normalized) {
            return response()->json(['success' => false, 'message' => 'Invalid phone number.'], 422);
        }

        $throttleKey = 'login:' . $normalized . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return response()->json([
                'success' => false,
                'message' => "Too many attempts. Try again in {$seconds} seconds.",
            ], 429);
        }

        $user = User::where('username', $normalized)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            return response()->json(['success' => false, 'message' => 'Invalid credentials.'], 401);
        }

        RateLimiter::clear($throttleKey);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data'    => [
                'token'                => $token,
                'must_change_password' => (bool) $user->must_change_password,
                'user'                 => [
                    'id'                   => $user->id,
                    'name'                 => $user->name,
                    'email'                => $user->email,
                    'phone'                => $user->phone,
                    'username'             => $user->username,
                    'must_change_password'   => (bool) $user->must_change_password,
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
                'phone'    => 'required|string|max:30',
                'email'    => 'nullable|email|max:255',
                'password' => ['nullable', 'confirmed', Password::defaults()],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        $normalized = PhoneHelper::normalize($request->phone);
        if (! $normalized) {
            return response()->json(['success' => false, 'message' => 'Invalid Pakistani mobile number.'], 422);
        }

        try {
            $parts = preg_split('/\s+/', trim($request->name), 2);
            [$user, $customer, $created] = $this->identity->findOrCreateByPhone($normalized, [
                'first_name' => $parts[0],
                'last_name'  => $parts[1] ?? null,
                'email'      => $request->email,
                'status'     => 'active',
            ]);

            if ($request->filled('password')) {
                $user->update([
                    'password'             => Hash::make($request->password),
                    'must_change_password' => false,
                ]);
            }

            if ($created && $user->email) {
                try {
                    Mail::to($user->email)->queue(new CustomerWelcomeMail($customer));
                } catch (\Throwable $mailEx) {
                    Log::error('CustomerWelcomeMail dispatch failed', ['user_id' => $user->id, 'error' => $mailEx->getMessage()]);
                }
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
            Log::error('API Register DB error: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Registration failed. Please try again.'], 500);
        } catch (\Exception $e) {
            Log::error('API Register error: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Registration failed. Please try again.'], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

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
                'username' => $user->username,
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
