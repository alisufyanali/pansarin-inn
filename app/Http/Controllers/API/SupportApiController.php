<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SupportApiController extends Controller
{
    /**
     * POST /api/support
     *
     * Submit a new support ticket.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'subject' => 'required|string|max:255',
                'message' => 'required|string|max:5000',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        }

        $ticket = Ticket::create([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status'  => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Support ticket submitted successfully. We will respond within 24 hours.',
            'data'    => [
                'ticket_id' => $ticket->id,
                'subject'   => $ticket->subject,
                'status'    => $ticket->status,
                'created_at'=> $ticket->created_at->toDateTimeString(),
            ],
        ], 201);
    }

    /**
     * GET /api/support
     *
     * List authenticated user's tickets.
     */
    public function index(Request $request)
    {
        $tickets = Ticket::where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data'    => $tickets->map(fn ($t) => [
                'id'         => $t->id,
                'subject'    => $t->subject,
                'message'    => $t->message,
                'status'     => $t->status,
                'created_at' => $t->created_at->toDateTimeString(),
            ]),
            'meta' => [
                'total'        => $tickets->total(),
                'per_page'     => $tickets->perPage(),
                'current_page' => $tickets->currentPage(),
                'last_page'    => $tickets->lastPage(),
            ],
        ]);
    }
}
