<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

/**
 * Storefront password reset (called by the Next.js route handlers
 * app/api/auth/forgot-password and app/api/auth/reset-password).
 *
 * The emailed link points at the storefront /reset-password page for
 * customers (see AppServiceProvider → ResetPassword::createUrlUsing).
 */
class PasswordResetApiController extends Controller
{
    // POST /api/forgot-password
    public function forgot(Request $request)
    {
        try {
            $data = $request->validate(['email' => 'required|email|max:255']);
        } catch (ValidationException $e) {
            return $this->validationError($e);
        }

        try {
            // INVALID_USER and RESET_THROTTLED get the same answer as success,
            // so the endpoint never reveals which emails have an account.
            Password::broker()->sendResetLink(['email' => strtolower(trim($data['email']))]);
        } catch (\Throwable $e) {
            Log::error('Password reset link could not be sent', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'We could not send the reset email right now. Please try again later.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'If an account exists for this email, a password reset link has been sent.',
        ]);
    }

    // POST /api/reset-password
    public function reset(Request $request)
    {
        try {
            $data = $request->validate([
                'token'    => 'required|string',
                'email'    => 'required|email|max:255',
                'password' => ['required', 'confirmed', PasswordRule::defaults()],
            ]);
        } catch (ValidationException $e) {
            return $this->validationError($e);
        }

        $status = Password::broker()->reset(
            [
                'email'                 => strtolower(trim($data['email'])),
                'token'                 => $data['token'],
                'password'              => $data['password'],
                'password_confirmation' => $request->input('password_confirmation'),
            ],
            function (User $user, string $password) {
                $user->forceFill([
                    'password'             => Hash::make($password),
                    'must_change_password' => false,
                    'remember_token'       => Str::random(60),
                ])->save();

                // Sign out every device that used the old password
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            $message = 'This password reset link is invalid or has expired. Please request a new one.';

            return response()->json([
                'success' => false,
                'message' => $message,
                'errors'  => ['email' => [$message]],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Your password has been reset. You can now log in with your new password.',
        ]);
    }

    private function validationError(ValidationException $e)
    {
        return response()->json([
            'success' => false,
            'message' => collect($e->errors())->flatten()->first(),
            'errors'  => $e->errors(),
        ], 422);
    }
}
