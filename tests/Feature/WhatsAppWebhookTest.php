<?php

it('does not verify the webhook when no verify token is configured', function () {
    config(['services.whatsapp.verify_token' => null]);

    $this->get('/whatsapp/webhook?hub_mode=subscribe&hub_challenge=<script>x</script>')
        ->assertForbidden();
});

it('echoes the challenge as plain text for the right token', function () {
    config(['services.whatsapp.verify_token' => 'secret-token']);

    $this->get('/whatsapp/webhook?hub_mode=subscribe&hub_verify_token=secret-token&hub_challenge=12345')
        ->assertOk()
        ->assertSee('12345')
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
});

it('rejects an unsigned POST when the app secret is configured', function () {
    config(['services.whatsapp.app_secret' => 'app-secret']);

    $this->postJson('/whatsapp/webhook', ['entry' => []])->assertForbidden();
});

it('accepts a correctly signed POST', function () {
    config(['services.whatsapp.app_secret' => 'app-secret']);
    $body = json_encode(['entry' => []]);

    $this->call('POST', '/whatsapp/webhook', [], [], [], [
        'CONTENT_TYPE'              => 'application/json',
        'HTTP_X_HUB_SIGNATURE_256'  => 'sha256=' . hash_hmac('sha256', $body, 'app-secret'),
    ], $body)->assertOk();
});

function waPayload(array $messages, array $contacts = []): array
{
    return ['object' => 'whatsapp_business_account', 'entry' => [[
        'id' => 'WABA', 'changes' => [['field' => 'messages', 'value' => [
            'messaging_product' => 'whatsapp', 'contacts' => $contacts, 'messages' => $messages,
        ]]],
    ]]];
}

it('stores every message of a batch with the contact name, once', function () {
    config(['services.whatsapp.app_secret' => null]);
    $payload = waPayload([
        ['from' => '923001112233', 'id' => 'wamid.1', 'timestamp' => '1790000000', 'type' => 'text', 'text' => ['body' => 'Salam']],
        ['from' => '923001112233', 'id' => 'wamid.2', 'timestamp' => '1790000005', 'type' => 'interactive',
         'interactive' => ['type' => 'button_reply', 'button_reply' => ['id' => 'b1', 'title' => 'Track order']]],
    ], [['wa_id' => '923001112233', 'profile' => ['name' => 'Ali']]]);

    $this->postJson('/whatsapp/webhook', $payload)->assertOk();
    $this->postJson('/whatsapp/webhook', $payload)->assertOk(); // Meta retry

    expect(\App\Models\WhatsappMessage::count())->toBe(2)
        ->and(\App\Models\WhatsappMessage::where('wa_message_id', 'wamid.1')->value('contact_name'))->toBe('Ali')
        ->and(\App\Models\WhatsappMessage::where('wa_message_id', 'wamid.2')->value('message'))->toBe('Track order');
});

it('downloads image media with the right extension', function () {
    config(['services.whatsapp.app_secret' => null, 'services.whatsapp.api_url' => 'https://graph.facebook.com']);
    \Illuminate\Support\Facades\Http::fake([
        'graph.facebook.com/v22.0/MEDIA1' => \Illuminate\Support\Facades\Http::response(['url' => 'https://lookaside.fbsbx.com/x', 'mime_type' => 'image/png']),
        'lookaside.fbsbx.com/*'           => \Illuminate\Support\Facades\Http::response('PNGDATA'),
    ]);

    $this->postJson('/whatsapp/webhook', waPayload([
        ['from' => '923001112233', 'id' => 'wamid.3', 'type' => 'image', 'image' => ['id' => 'MEDIA1', 'mime_type' => 'image/png', 'caption' => 'Receipt']],
    ]))->assertOk();

    $msg = \App\Models\WhatsappMessage::sole();
    expect($msg->media_url)->toBe('media_MEDIA1.png')
        ->and($msg->message)->toBe('Receipt')
        ->and(file_exists(public_path('storage/whatsapp/media_MEDIA1.png')))->toBeTrue();

    @unlink(public_path('storage/whatsapp/media_MEDIA1.png'));
});

it('answers 200 even when a message cannot be processed', function () {
    config(['services.whatsapp.app_secret' => null]);

    $this->postJson('/whatsapp/webhook', waPayload([['id' => 'wamid.4', 'type' => 'text']]))->assertOk();
    expect(\App\Models\WhatsappMessage::count())->toBe(0);
});
