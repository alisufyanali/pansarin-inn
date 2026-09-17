<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Models\WhatsappMessageLog;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendBulkWhatsAppMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 30;
    public int $backoff = 30;

    /**
     * @param int $customerId
     * @param string $message
     * @param string $mode 'text' or 'template'
     * @param string|null $templateName
     * @param array $templateParams
     */
    public function __construct(
        public int $customerId,
        public string $message,
        public string $mode = 'text',
        public ?string $templateName = null,
        public array $templateParams = []
    ) {}

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $whatsappService): void
    {
        $customer = Customer::find($this->customerId);
        if (!$customer) {
            Log::warning('SendBulkWhatsAppMessage: Customer not found', ['customer_id' => $this->customerId]);
            return;
        }

        $rawPhone = (string) $customer->phone;
        $customerName = trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? ''));
        if ($customerName === '') {
            $customerName = 'Customer';
        }

        // Clean phone number: remove non-digits, normalize 03xx -> 923xx
        $cleanPhone = preg_replace('/[^0-9]/', '', $rawPhone);
        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '92' . substr($cleanPhone, 1);
        }

        // Pre-validate phone format
        if (strlen($cleanPhone) < 10) {
            Log::warning('SendBulkWhatsAppMessage: Invalid phone number', [
                'customer_id' => $customer->id,
                'phone'       => $rawPhone,
            ]);

            WhatsappMessageLog::create([
                'phone'            => $cleanPhone ?: $rawPhone,
                'customer_name'    => $customerName,
                'order_id'         => 'BULK-SKIP',
                'order_total'      => 0,
                'delivery_address' => '',
                'messages'         => $this->message,
                'api_response'     => json_encode([
                    'error' => [
                        'message' => 'Invalid phone number format. Skipping API dispatch.',
                        'code'    => 'INVALID_PHONE_FORMAT',
                    ]
                ]),
            ]);
            return;
        }

        try {
            Log::info('SendBulkWhatsAppMessage dispatching', [
                'customer_id' => $customer->id,
                'phone'       => $cleanPhone,
                'mode'        => $this->mode,
            ]);

            $response = null;

            if ($this->mode === 'template' && !empty($this->templateName)) {
                $orderTotal = (float) ($this->templateParams['order_total'] ?? 0);
                $orderTotalFormatted = $this->templateParams['order_total_formatted'] ?? 'Rs. 0';
                $orderNumber = $this->templateParams['order_id'] ?? ('BULK-' . $customer->id);
                $deliveryAddress = $this->templateParams['delivery_address'] ?? ($customer->address ?? '');

                $response = $whatsappService->sendTemplateMessage(
                    $cleanPhone,
                    $customerName,
                    $orderNumber,
                    $orderTotal,
                    $orderTotalFormatted,
                    $deliveryAddress,
                    $this->templateName
                );
            } else {
                $response = $whatsappService->sendTextMessage($cleanPhone, $this->message);
            }

            WhatsappMessageLog::create([
                'phone'            => $cleanPhone,
                'customer_name'    => $customerName,
                'order_id'         => 'BULK-' . date('YmdHi'),
                'order_total'      => 0,
                'delivery_address' => $customer->address ?? '',
                'messages'         => $this->message,
                'api_response'     => is_array($response) ? json_encode($response) : (string) $response,
            ]);

            Log::info('SendBulkWhatsAppMessage completed', [
                'customer_id' => $customer->id,
                'phone'       => $cleanPhone,
                'status'      => 'logged',
            ]);

        } catch (\Throwable $e) {
            Log::error('SendBulkWhatsAppMessage failed', [
                'customer_id' => $customer->id,
                'phone'       => $cleanPhone,
                'error'       => $e->getMessage(),
            ]);

            WhatsappMessageLog::create([
                'phone'            => $cleanPhone,
                'customer_name'    => $customerName,
                'order_id'         => 'BULK-ERROR',
                'order_total'      => 0,
                'delivery_address' => '',
                'messages'         => $this->message,
                'api_response'     => json_encode([
                    'error' => [
                        'message' => $e->getMessage(),
                        'code'    => $e->getCode(),
                    ]
                ]),
            ]);
        }
    }
}
