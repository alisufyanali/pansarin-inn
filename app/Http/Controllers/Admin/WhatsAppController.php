<?php

// app/Http/Controllers/Admin/WhatsAppController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use App\Models\WhatsappMessageLog;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
                'timestamp' => now()->toIso8601String(),
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

            if (WhatsAppService::isFailure($response)) {
                $error = 'WhatsApp did not send the message: ' . ($response['error']['message'] ?? 'unknown error');
                Log::warning('WHATSAPP CONTROLLER SEND FAILED', ['code' => $response['error']['code'] ?? null]);

                // withErrors (not a flash) so the chat's onError runs and the
                // message is not shown as sent
                if (request()->header('X-Inertia')) {
                    return back()->withErrors(['message' => $error]);
                }

                return response()->json(['success' => false, 'error' => $error, 'response' => $response], 422);
            }

            Log::info('WHATSAPP CONTROLLER SEND RESPONSE', ['status' => 'sent']);

            // If Inertia request, redirect back with success
            if (request()->header('X-Inertia')) {
                return back()->with('success', 'Message sent successfully.');
            }

            return response()->json([
                'success' => true,
                'response' => $response,
            ]);

        } catch (\Exception $e) {
            Log::error('WhatsApp sendMessage failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to send message. Please try again.',
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

            // An unset verify token must never match a missing query param (null === null)
            if ($mode === 'subscribe' && $verifyToken && is_string($token) && hash_equals((string) $verifyToken, $token)) {
                // Plain text: the challenge is echoed back, so it must not render as HTML
                return response((string) $challenge, 200)->header('Content-Type', 'text/plain');
            }

            return response('Forbidden', 403);
        }

        // POST: only accept payloads signed by Meta with our app secret
        $appSecret = config('services.whatsapp.app_secret');
        if ($appSecret) {
            $expected  = 'sha256=' . hash_hmac('sha256', $request->getContent(), $appSecret);
            $signature = (string) $request->header('X-Hub-Signature-256');
            if (! hash_equals($expected, $signature)) {
                Log::warning('WhatsApp webhook rejected: bad signature', ['ip' => $request->ip()]);

                return response('Forbidden', 403);
            }
        } else {
            Log::warning('WhatsApp webhook: WHATSAPP_APP_SECRET is not set, signature not verified');
        }

        // POST: incoming messages. Meta may batch several entries/changes/messages in one
        // call and retries until it gets a 200 — so every message is handled, duplicates are
        // skipped by their wamid, and we always answer 200 once the signature is valid.
        try {
            $data = $request->all();
            $saved = 0;

            foreach ($data['entry'] ?? [] as $entry) {
                foreach ($entry['changes'] ?? [] as $change) {
                    $value = $change['value'] ?? [];
                    $names = collect($value['contacts'] ?? [])
                        ->mapWithKeys(fn ($c) => [($c['wa_id'] ?? '') => $c['profile']['name'] ?? null]);

                    foreach ($value['messages'] ?? [] as $messageData) {
                        $saved += $this->storeIncomingMessage($messageData, $names->get($messageData['from'] ?? '')) ? 1 : 0;
                    }
                    // $value['statuses'] (sent/delivered/read receipts) are not stored
                }
            }

            Log::info('WhatsApp webhook processed', ['messages_saved' => $saved]);
        } catch (\Throwable $e) {
            Log::error('WhatsApp Webhook Error', ['error' => $e->getMessage()]);
        }

        return response('OK', 200);
    }

    /** Save one incoming message; false when it was already stored (Meta retry) or unusable. */
    protected function storeIncomingMessage(array $messageData, ?string $contactName): bool
    {
        $waId = $messageData['id'] ?? null;
        $from = $messageData['from'] ?? null;
        $type = $messageData['type'] ?? 'unknown';

        if (! $from || ($waId && WhatsappMessage::where('wa_message_id', $waId)->exists())) {
            return false;
        }

        $mediaFileName = null;
        $message = match ($type) {
            'text'        => $messageData['text']['body'] ?? '',
            'button'      => $messageData['button']['text'] ?? '',
            'interactive' => $messageData['interactive']['button_reply']['title']
                             ?? $messageData['interactive']['list_reply']['title']
                             ?? '[Interactive reply]',
            'location'    => trim('📍 ' . ($messageData['location']['name'] ?? '') . ' '
                             . ($messageData['location']['latitude'] ?? '') . ',' . ($messageData['location']['longitude'] ?? '')),
            'reaction'    => 'Reacted ' . ($messageData['reaction']['emoji'] ?? ''),
            'contacts'    => '[Contact card]',
            default       => '',
        };

        if (in_array($type, ['image', 'document', 'audio', 'video', 'sticker'], true)) {
            $media = $messageData[$type] ?? [];
            if (! empty($media['id'])) {
                $mediaFileName = $this->downloadMedia($media['id'], $type, $media['mime_type'] ?? null);
            }
            $caption = $media['caption'] ?? ($media['filename'] ?? null);
            $message = $caption ?: strtoupper($type) . ' RECEIVED';
        } elseif ($message === '') {
            $message = '[' . ucfirst($type) . ' message]';
        }

        try {
            $stored = WhatsappMessage::create([
                'wa_message_id' => $waId,
                'from_number'   => $from,
                'contact_name'  => $contactName,
                'type'          => $type,
                'message'       => $message,
                'media_url'     => $mediaFileName,
                'received_at'   => isset($messageData['timestamp'])
                    ? \Illuminate\Support\Carbon::createFromTimestamp((int) $messageData['timestamp'])
                    : now(),
            ]);
        } catch (\Illuminate\Database\UniqueConstraintViolationException) {
            return false; // a parallel retry already stored it
        }

        // Bell notification for staff; never fail the webhook over it (Meta would retry)
        try {
            foreach (\App\Models\User::notifiableStaff()->get() as $admin) {
                $admin->notify(new \App\Notifications\WhatsAppMessageReceivedNotification($stored));
            }
        } catch (\Throwable $e) {
            Log::error('WhatsAppMessageReceivedNotification failed', ['error' => $e->getMessage()]);
        }

        return true;
    }

    /**
     * Download media from WhatsApp into public/storage/whatsapp (served as
     * /storage/whatsapp/{file}, no storage:link needed — same as other uploads).
     */
    protected function downloadMedia(string $mediaId, string $type, ?string $mimeType = null): ?string
    {
        $accessToken = config('services.whatsapp.access_token');
        $apiUrl      = rtrim(config('services.whatsapp.api_url', 'https://graph.facebook.com'), '/');

        try {
            // 1. Media id → temporary download URL
            $info     = Http::withToken($accessToken)->timeout(15)->get("{$apiUrl}/" . WhatsAppService::GRAPH_VERSION . "/{$mediaId}")->json();
            $mediaUrl = $info['url'] ?? null;
            if (! $mediaUrl) {
                Log::warning('WhatsApp media URL missing', ['media_id' => $mediaId, 'response' => $info]);

                return null;
            }

            // 2. Download (the URL also needs the bearer token)
            $download = Http::withToken($accessToken)->timeout(30)->get($mediaUrl);
            if (! $download->successful()) {
                Log::warning('WhatsApp media download failed', ['media_id' => $mediaId, 'status' => $download->status()]);

                return null;
            }

            $ext = $this->extensionFor($info['mime_type'] ?? $mimeType, $type);
            $fileName = 'media_' . preg_replace('/[^A-Za-z0-9_-]/', '', $mediaId) . '.' . $ext;

            $directory = public_path('storage/whatsapp');
            if (! is_dir($directory)) {
                mkdir($directory, 0755, true);
            }
            file_put_contents($directory . DIRECTORY_SEPARATOR . $fileName, $download->body());

            return $fileName;
        } catch (\Throwable $e) {
            Log::error('Media Download Error', ['media_id' => $mediaId, 'error' => $e->getMessage()]);

            return null;
        }
    }

    protected function extensionFor(?string $mimeType, string $type): string
    {
        $map = [
            'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif',
            'audio/ogg' => 'ogg', 'audio/mpeg' => 'mp3', 'audio/mp4' => 'm4a', 'audio/aac' => 'aac', 'audio/amr' => 'amr',
            'video/mp4' => 'mp4', 'video/3gpp' => '3gp',
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/vnd.ms-excel' => 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
            'text/plain' => 'txt',
        ];
        $mimeType = strtolower(trim(explode(';', (string) $mimeType)[0]));

        return $map[$mimeType] ?? match ($type) {
            'image' => 'jpg', 'sticker' => 'webp', 'audio' => 'ogg', 'video' => 'mp4', default => 'bin',
        };
    }
}
