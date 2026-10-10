<?php

namespace App\Services;

/** Stops a courier booking early with a ready-made failed result (see CourierService). */
class CourierBookingFailed extends \RuntimeException
{
    public function __construct(public array $result)
    {
        parent::__construct($result['message'] ?? 'Courier booking failed');
    }
}
