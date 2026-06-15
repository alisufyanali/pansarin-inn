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
            'subject' => $request->subject ?? null,
            'message' => $request->message,
            'status'  => 'new',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your message has been sent successfully.',
            'data'    => ['id' => $contact->id],
        ], 201);
    }
}
