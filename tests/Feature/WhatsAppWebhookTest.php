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
