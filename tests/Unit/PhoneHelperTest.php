<?php

namespace Tests\Unit;

use App\Helpers\PhoneHelper;
use PHPUnit\Framework\TestCase;

class PhoneHelperTest extends TestCase
{
    /**
     * Each input normalizes to its own canonical 923XXXXXXXXX value.
     */
    public function test_pk_shapes_normalize_to_canonical(): void
    {
        $cases = [
            // 03XX format
            '03001234567'    => '923001234567',
            '0300-1234567'   => '923001234567',
            // 3XX format (10 digits starting with 3)
            '3001234567'     => '923001234567',
            // 923XX already canonical
            '923001234567'   => '923001234567',
            // +923XX international
            '+923001234567'  => '923001234567',
            // 00923XX
            '00923001234567' => '923001234567',
            // With spaces and dashes — same underlying number
            '+92 300-1234567'=> '923001234567',
            // Different number — must produce its own canonical
            '0315 2629486'   => '923152629486',
            '03152629486'    => '923152629486',
            '+923152629486'  => '923152629486',
        ];

        foreach ($cases as $input => $expected) {
            $this->assertSame(
                $expected,
                PhoneHelper::normalize($input),
                "normalize('{$input}') expected '{$expected}'"
            );
        }
    }

    public function test_invalid_returns_null(): void
    {
        $this->assertNull(PhoneHelper::normalize('12345'),       'too short');
        $this->assertNull(PhoneHelper::normalize('+441234567890'), 'UK number');
        $this->assertNull(PhoneHelper::normalize(''),            'empty string');
        $this->assertNull(PhoneHelper::normalize(null),          'null');
        $this->assertNull(PhoneHelper::normalize('abcdefghijk'), 'non-numeric');
    }

    public function test_normalize_failure_reason(): void
    {
        $this->assertSame('empty_phone',     PhoneHelper::normalizeFailureReason(null));
        $this->assertSame('empty_phone',     PhoneHelper::normalizeFailureReason(''));
        $this->assertSame('too_short',       PhoneHelper::normalizeFailureReason('12345'));
        $this->assertSame('non_digit_chars', PhoneHelper::normalizeFailureReason('abc-phone'));
        $this->assertSame('wrong_prefix',    PhoneHelper::normalizeFailureReason('12345678901'));
    }

    public function test_mask_returns_pattern(): void
    {
        $masked = PhoneHelper::mask('923001234567');
        $this->assertMatchesRegularExpression('/^\d{2}\*{2}-\*{3}-\*{2}\d{2}$/', $masked);
    }

    public function test_looks_like_phone(): void
    {
        $this->assertTrue(PhoneHelper::looksLikePhone('03001234567'));
        $this->assertTrue(PhoneHelper::looksLikePhone('+923001234567'));
        $this->assertFalse(PhoneHelper::looksLikePhone('admin@example.com'));
        $this->assertFalse(PhoneHelper::looksLikePhone(''));
    }
}
