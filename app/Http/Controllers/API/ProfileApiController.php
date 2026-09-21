<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Helpers\PhoneHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class ProfileApiController extends Controller
{
    /**
     * PUT /api/profile
     *
     * Update authenticated user's name, phone, and customer profile fields.
     * Email is intentionally not updatable here — requires a separate verified flow.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        try {
            $validated = $request->validate([
                'name'       => 'sometimes|string|max:255',
                'phone'      => ['sometimes', 'string', 'max:20', function ($attr, $value, $fail) use ($user) {
                    $n = PhoneHelper::normalize($value);
                    if (! $n) {
                        $fail('Invalid Pakistani mobile number.');
                    }
                    if (\App\Models\User::where('username', $n)->where('id', '!=', $user->id)->exists()) {
                        $fail('This phone is already registered.');
                    }
                }],
                'first_name' => 'sometimes|string|max:100',
                'last_name'  => 'sometimes|nullable|string|max:100',
                'address'    => 'sometimes|nullable|string|max:255',
                'address2'   => 'sometimes|nullable|string|max:255',
                'city_id'    => 'sometimes|nullable|exists:cities,id',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        // Update User table fields
        $userFields = array_intersect_key($validated, array_flip(['name', 'phone']));
        if (! empty($userFields)) {
            $user->update($userFields);
        }

        // Update Customer profile fields
        $customerFields = array_intersect_key($validated, array_flip(['first_name', 'last_name', 'address', 'address2', 'city_id']));
        if (! empty($customerFields) && $user->customer) {
            $user->customer->update($customerFields);
        }

        $user->refresh();
        $customer = $user->customer?->fresh();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'customer' => $customer ? [
                    'id'         => $customer->id,
                    'first_name' => $customer->first_name,
                    'last_name'  => $customer->last_name,
                    'address'    => $customer->address,
                    'address2'   => $customer->address2,
                    'city_id'    => $customer->city_id,
                ] : null,
            ],
        ]);
    }

    /**
     * POST /api/change-password
     *
     * Change password for authenticated user.
     * Requires current_password for verification.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        try {
            $request->validate([
                'current_password' => 'required|string',
                'password'         => [
                    'required',
                    'confirmed',
                    Password::defaults(),
                    // Phone number must not be used as a password
                    \Illuminate\Validation\Rule::notIn(array_values(array_unique(array_filter([
                        $user->phone,
                        $user->username,
                        $user->customer?->phone,
                    ])))),
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
                'errors'  => ['current_password' => ['Current password is incorrect.']],
            ], 422);
        }

        $user->update([
            'password'             => Hash::make($request->password),
            'must_change_password' => false,
        ]);

        // Revoke all other tokens so existing sessions are invalidated
        $currentTokenId = $user->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully. Other devices have been logged out.',
        ]);
    }
}
