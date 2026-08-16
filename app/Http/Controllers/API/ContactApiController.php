<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ContactRepository;
use Illuminate\Http\Request;

class ContactApiController extends Controller
{
    public function __construct(protected ContactRepository $contactRepo) {}

    // POST /api/contact
    public function store(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        $contact = $this->contactRepo->store([
            'name'    => $request->name,
            'email'   => $request->email,
            'phone'   => $request->phone ?? null,
            'subject' => $request->subject ?? 'No Subject',
            'message' => $request->message,
            'status'  => 'new',
        ]);

        // Notify all admins of the new contact message
        try {
            $admins = \App\Models\User::role('admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\ContactMessageNotification($contact));
            }
        } catch (\Throwable $notifyEx) {
            \Illuminate\Support\Facades\Log::error('ContactMessageNotification dispatch failed', [
                'contact_id' => $contact->id,
                'error'      => $notifyEx->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Your message has been sent successfully.',
            'data'    => ['id' => $contact->id],
        ], 201);
    }
}
