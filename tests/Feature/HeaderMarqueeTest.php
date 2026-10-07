<?php

use App\Models\UiSetting;

it('returns the admin marquee text one message per line', function () {
    UiSetting::create(['type' => 'marquee_text', 'value' => "Cash on delivery\r\n\n  Fresh herbs daily  \n"]);

    $this->getJson('/api/header')->assertOk()
        ->assertJsonPath('data.messages', ['Cash on delivery', 'Fresh herbs daily']);
});

it('falls back to the tagline when no marquee text is set', function () {
    $this->getJson('/api/header')->assertOk()
        ->assertJsonPath('data.messages', ['100% Ayurvedic & Herbal Products']);
});
