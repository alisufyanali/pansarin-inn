<?php

// app/Http/Controllers/Admin/WhatsAppController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use App\Models\WhatsappMessageLog;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia; 

class WhatsAppController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
        $this->middleware('permission:view.whatsapp')->only(['index', 'getPhoneNumbers', 'getMessages']);
        $this->middleware('permission:send.whatsapp')->only(['sendMessage', 'addNumber']);
    }

    /**
     * Display chat interface
     */
    public function index()
    {
        return Inertia::render('Admin/WhatsApp/Chat');
    }

    /**
     * Get all phone numbers with chat history
     */
    public function getPhoneNumbers()
    {
        // Get sent messages
        $sent = WhatsappMessageLog::select('phone', DB::raw('MAX(created_at) as last_activity'))
            ->groupBy('phone')
            ->orderByDesc('last_activity')
            ->limit(300)
            ->get();

        // Get received messages
        $received = WhatsappMessage::select(
            DB::raw('from_number as phone'),
            DB::raw('MAX(received_at) as last_activity')
        )
            ->groupBy('from_number')
            ->orderByDesc('last_activity')
            ->limit(300)
            ->get();

        // Merge and normalize
        $phones = [];
        foreach ($sent->concat($received) as $row) {
            $cleanPhone = preg_replace('/\D+/', '', $row->phone);
            $time = $row->last_activity;

            if (! isset($phones[$cleanPhone]) ||
                strtotime($time) > strtotime($phones[$cleanPhone]['last_activity'])) {
                $phones[$cleanPhone] = [
                    'phone' => $cleanPhone,
                    'last_activity' => $time,
                ];
            }
        }

        // Get unread counts
        $unreadCounts = WhatsappMessage::select(
            DB::raw("REPLACE(REPLACE(REPLACE(from_number, '-', ''), ' ', ''), '+', '') as phone"),
            DB::raw('COUNT(*) as unread')
        )
            ->where('is_read', false)
            ->groupBy('phone')
            ->pluck('unread', 'phone')
            ->toArray();

        // Add unread counts
        foreach ($phones as &$p) {
            $p['unread'] = $unreadCounts[$p['phone']] ?? 0;
        }

        // Sort by last activity
        $sorted = array_values($phones);
        usort($sorted, function ($a, $b) {
            return strtotime($b['last_activity']) - strtotime($a['last_activity']);
        });

        return response()->json($sorted);
    }

    /**
     * Get messages for a specific phone number
     */
    public function getMessages($phone)
    {
        $cleanPhone = preg_replace('/\D+/', '', $phone);

        // Get latest order_id
        $latestLog = WhatsappMessageLog::forPhone($cleanPhone)
            ->latest()
            ->first();

        $orderId = $latestLog ? $latestLog->order_id : 'N/A';

        // Get sent messages
        $sent = WhatsappMessageLog::forPhone($cleanPhone)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'type' => 'sent',
                    'message' => $msg->messages,
                    'time' => $msg->created_at->toDateTimeString(),
                    'media_url' => null,
                ];
            });

        // Get received messages
        $received = WhatsappMessage::fromNumber($cleanPhone)
            ->orderBy('received_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'type' => 'received',
                    'message' => $msg->message,
                    'time' => $msg->received_at->toDateTimeString(),
                    'media_url' => $msg->media_url,
                ];
            });

        // Merge and sort by time
        $messages = $sent->concat($received)->sortBy(function ($msg) {
            return strtotime($msg['time']);
        })->values();

        // Mark as read
        WhatsappMessage::fromNumber($cleanPhone)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'phone' => $cleanPhone,
            'order_id' => $orderId,
            'messages' => $messages,
        ]);
    }

    /**
     * Add a new phone number to chat list
     */
    public function addNumber(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|min:7|max:20',
        ]);

        $cleanPhone = preg_replace('/\D+/', '', $request->phone);

        // Check if number already exists
        $exists = WhatsappMessageLog::where('phone', $cleanPhone)->exists()
            || WhatsappMessage::where('from_number', $cleanPhone)->exists();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Number already exists.'], 409);
        }

        // Create a placeholder log entry so the number appears in the chat list
        WhatsappMessageLog::create([
            'phone'            => $cleanPhone,
            'customer_name'    => 'Manual',
            'order_id'         => 'Manual-'.mt_rand(1000, 9999),
            'order_total'      => 0,
            'delivery_address' => '',
            'messages'         => '',
            'api_response'     => json_encode([]),
        ]);

        return response()->json(['success' => true, 'phone' => $cleanPhone]);
    }

    /**
     * Send message
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string',
        ]);

        try {
            Log::info('WHATSAPP CONTROLLER SEND START', [
                'phone' => $request->phone,
                'clean_phone' => preg_replace('/\D+/', '', $request->phone),
                'message' => $request->message,
            ]);

            $response = $this->whatsappService->sendTextMessage(
                $request->phone,
                $request->message
            );

            WhatsappMessageLog::create([
                'phone' => preg_replace('/\D+/', '', $request->phone),
                'customer_name' => 'Manual',
                'order_id' => 'Manual-'.mt_rand(1000, 9999),
                'order_total' => 0,
                'delivery_address' => '',
                'messages' => $request->message,
                'api_response' => json_encode($response),
            ]);

            Log::info('WHATSAPP CONTROLLER SEND RESPONSE', ['response' => $response]);

            // If Inertia request, redirect back with success
            if (request()->header('X-Inertia')) {
                return back()->with('success', 'Message sent successfully.');
            }

            return response()->json([
                'success' => true,
                'response' => $response,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Webhook for receiving messages
     */
    public function webhook(Request $request)
    {
        $verifyToken = config('services.whatsapp.verify_token');

        // GET: Webhook verification
        if ($request->isMethod('get')) {
            $mode = $request->query('hub_mode');
            $token = $request->query('hub_verify_token');
            $challenge = $request->query('hub_challenge');

            if ($mode === 'subscribe' && $token === $verifyToken) {
                return response($challenge, 200);
            }

            return response('Forbidden', 403);
        }

        // POST: Handle incoming messages
        try {
            $data = $request->all();

            // Log webhook data
            Log::info('WhatsApp Webhook', ['data' => $data]);

            $messageData = $data['entry'][0]['changes'][0]['value']['messages'][0] ?? null;

            if ($messageData) {
                $from = $messageData['from'];
                $type = $messageData['type'];
                $message = '';
                $mediaFileName = null;

                if ($type === 'text') {
                    $message = $messageData['text']['body'];
                }

                // Handle media
                if (in_array($type, ['image', 'document', 'audio'])) {
                    $mediaId = $messageData[$type]['id'];
                    $mediaFileName = $this->downloadMedia($mediaId, $type);
                    $message = strtoupper($type).' RECEIVED';
                }

                // Save message
                WhatsappMessage::create([
                    'from_number' => $from,
                    'message' => $message,
                    'media_url' => $mediaFileName,
                    'received_at' => now(),
                ]);
            }

            return response('OK', 200);
        } catch (\Exception $e) {
            Log::error('WhatsApp Webhook Error', ['error' => $e->getMessage()]);

            return response('OK', 200);
        }
    }

    /**
     * Download media from WhatsApp
     */
    protected function downloadMedia($mediaId, $type)
    {
        $accessToken = config('services.whatsapp.access_token');

        try {
            // Get media URL
            $response = Http::withToken($accessToken)
                ->get("https://graph.facebook.com/v17.0/{$mediaId}");

            $mediaUrl = $response->json()['url'] ?? null;

            if (! $mediaUrl) {
                return null;
            }

            // Download media
            $mediaContent = Http::withToken($accessToken)
                ->get($mediaUrl)
                ->body();

            // Determine extension from type
            $extMap = ['image' => 'jpg', 'document' => 'pdf', 'audio' => 'ogg'];
            $ext = $extMap[$type] ?? 'bin';
            $fileName = 'media_'.time().'.'.$ext;

            // Save file
            Storage::disk('public')->put("whatsapp/{$fileName}", $mediaContent);

            return $fileName;
        } catch (\Exception $e) {
            Log::error('Media Download Error', ['error' => $e->getMessage()]);

            return null;
        }
    }
}
