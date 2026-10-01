<?php

use App\Exceptions\WhatsAppApiException;
use App\Services\WhatsAppService;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/** Replace the default "accepted" WhatsApp fake from TestCase with a Meta reply */
function fakeMetaReply(array|string $body, int $status): void
{
    Http::swap(new Factory);
    Http::preventStrayRequests();
    Http::fake(['graph.facebook.com/*' => Http::response($body, $status)]);
}

it('sends through the shared Graph API version', function () {
    $response = app(WhatsAppService::class)->sendTextMessage('03001234567', 'Hi');

    expect(WhatsAppService::isFailure($response))->toBeFalse();
    Http::assertSent(fn ($r) => str_contains($r->url(), '/' . WhatsAppService::GRAPH_VERSION . '/'));
});

it('reports a Meta rejection as a non-retryable failure', function () {
    fakeMetaReply(['error' => ['code' => 131030, 'message' => 'Recipient phone number not in allowed list']], 400);

    $service  = app(WhatsAppService::class);
    $response = $service->sendTextMessage('03001234567', 'Hi');

    expect(WhatsAppService::isFailure($response))->toBeTrue();

    try {
        $service->throwIfFailed($response);
        $this->fail('Expected WhatsAppApiException');
    } catch (WhatsAppApiException $e) {
        expect($e->retryable)->toBeFalse()
            ->and($e->getCode())->toBe(131030);
    }
});

it('treats rate limits and Meta outages as retryable', function () {
    expect((new WhatsAppApiException(['error' => ['code' => 130429]]))->retryable)->toBeTrue();

    // A non-JSON 502 page still counts as a failure, and a retryable one
    fakeMetaReply('<html>Bad Gateway</html>', 502);
    $response = app(WhatsAppService::class)->sendTextMessage('03001234567', 'Hi');

    expect(WhatsAppService::isFailure($response))->toBeTrue()
        ->and((new WhatsAppApiException($response))->retryable)->toBeTrue();
});

it('emails the admin once per error code per hour', function () {
    config(['mail.admin_email' => 'admin@example.com']);
    fakeMetaReply(['error' => ['code' => 131047, 'message' => 'Re-engagement message']], 400);

    $service = app(WhatsAppService::class);
    $service->sendTextMessage('03001234567', 'one');
    expect(Cache::has('whatsapp-error-email:131047'))->toBeTrue();

    // A second failure with the same code inside the hour sends no new email
    Cache::put('whatsapp-error-email:131047', 'sentinel', now()->addHour());
    $service->sendTextMessage('03001234568', 'two');
    expect(Cache::get('whatsapp-error-email:131047'))->toBe('sentinel');
});

it('logs a rejected order template with Meta\'s error', function () {
    fakeMetaReply(['error' => ['code' => 131030, 'message' => 'Recipient phone number not in allowed list']], 400);

    $response = app(WhatsAppService::class)
        ->sendTemplateMessage('03001234567', 'Ali', 'ORD-1', 100.0, 'Rs. 100', 'Lahore');

    expect(WhatsAppService::isFailure($response))->toBeTrue();
    expect(\App\Models\WhatsappMessageLog::where('order_id', 'ORD-1')->value('api_response'))
        ->toContain('131030');
});

it('does not throw out of a job for a rejection a retry cannot fix', function () {
    fakeMetaReply(['error' => ['code' => 131047, 'message' => 'Re-engagement message']], 400);

    $customer = new \App\Models\Customer(['first_name' => 'Ali', 'phone' => '03001234567']);
    $customer->id = 1;

    // Same direct call the admin controllers make on the sync queue
    (new \App\Jobs\SendCustomerWelcomeWhatsApp($customer))->handle(app(WhatsAppService::class));

    expect(\App\Models\WhatsappMessageLog::where('order_id', 'Welcome')->value('api_response'))
        ->toContain('131047');
});
