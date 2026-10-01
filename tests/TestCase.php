<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Tests must never reach the real Meta API: with the sync queue every
        // order/sale test used to send a real WhatsApp message. Sends get a
        // fake "accepted" reply; any other un-faked outbound call fails loudly.
        Http::preventStrayRequests();
        Http::fake([
            'graph.facebook.com/*/messages' => Http::response([
                'messaging_product' => 'whatsapp',
                'messages'          => [['id' => 'wamid.test']],
            ]),
        ]);
    }
}
