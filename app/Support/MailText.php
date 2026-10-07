<?php

namespace App\Support;

use Illuminate\Support\HtmlString;

class MailText
{
    /**
     * Text that Gmail / Apple Mail must not turn into a link. They auto-link
     * anything that looks like a street address ("house # 123, ... road,
     * karachi" → Google Maps). A zero-width space after every space, digit and
     * punctuation mark breaks that pattern; on screen the text is unchanged.
     */
    public static function unlinked(?string $text): HtmlString
    {
        // Split first, escape each piece — so no break ever lands inside an entity
        $parts = preg_split('/(?<=[\s\d,.#\/-])/u', (string) $text) ?: [(string) $text];

        return new HtmlString(implode('&#8203;', array_map('e', $parts)));
    }
}
