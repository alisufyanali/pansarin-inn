<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Meta's WhatsApp Cloud API rejected a send (an `error` in the response body).
 *
 * `retryable` is true only for temporary failures (rate limits, Meta outages);
 * errors such as a recipient outside the 24-hour window or a test number's
 * allow-list never succeed on a retry.
 */
class WhatsAppApiException extends RuntimeException
{
    /** Meta error codes that may succeed if the job runs again later */
    private const RETRYABLE_CODES = [1, 2, 4, 80007, 130429, 131000, 131016, 131056, 133004];

    public readonly bool $retryable;

    public function __construct(public readonly array $response)
    {
        $code = (int) ($response['error']['code'] ?? 0);

        $this->retryable = in_array($code, self::RETRYABLE_CODES, true);

        parent::__construct(
            sprintf('WhatsApp API error %d: %s', $code, $response['error']['message'] ?? 'unknown error'),
            $code,
        );
    }
}
