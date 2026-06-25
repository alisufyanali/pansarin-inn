<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class NewsletterApiController extends Controller
{
    // POST /api/newsletter/subscribe
    public function subscribe(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|max:255',
                'name'  => 'nullable|string|max:255',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        $existing = Newsletter::where('email', $request->email)->first();

        if ($existing) {
            // Idempotent — already subscribed
            if ($existing->status === 'unsubscribed') {
                // Re-subscribe silently
                $existing->update(['status' => 'active']);
                return response()->json([
                    'success' => true,
                    'message' => 'You have been re-subscribed successfully.',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Already subscribed.',
            ]);
        }

        Newsletter::create([
            'email'      => $request->email,
            'name'       => $request->name ?? null,
            'status'     => 'active',
            'source'     => 'api',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to($request->email)
                ->queue(new \App\Mail\NewsletterWelcome($request->email, $request->name ?? ''));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('NewsletterWelcome mail failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Subscribed successfully.',
        ], 201);
    }
}
