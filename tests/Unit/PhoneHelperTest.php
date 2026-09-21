<?php

namespace Tests\Unit;

use App\Helpers\PhoneHelper;
use PHPUnit\Framework\TestCase;

class PhoneHelperTest extends TestCase
{
    public function test_pk_shapes_normalize_to_same_canonical(): void
    {
        $expected = '923001234567';
        $inputs = [
            '03001234567',
            '3001234567',
            '923001234567',
            '+923001234567',
            '00923001234567',
            '+92 300-1234567',
            '0315 2629486',
            '92-315-2629486',
        ];

        foreach ($inputs as $input) {
            $this->assertSame($expected, PhoneHelper::normalize($input), "Failed for: {$input}");
        }
    }

    public function test_invalid_returns_null(): void
    {
        $this->assertNull(PhoneHelper::normalize('12345'));
        $this->assertNull(PhoneHelper::normalize('+441234567890'));
    }
}
