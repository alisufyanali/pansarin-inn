<?php

namespace App\Helpers;

class PhoneHelper
{
    /**
     * Canonical stored format: 923XXXXXXXXX (12 digits, ^923\d{9}$).
     */
    public static function normalize(?string $phone): ?string
    {
        if ($phone === null || trim($phone) === '') {
            return null;
        }

        $clean = preg_replace('/[^0-9]/', '', $phone);
        if ($clean === '') {
            return null;
        }

        if (preg_match('/^923\d{9}$/', $clean)) {
            return $clean;
        }

        if (str_starts_with($clean, '0092') && strlen($clean) === 14) {
            $clean = '92' . substr($clean, 4);
        } elseif (str_starts_with($clean, '00923') && strlen($clean) === 15) {
            $clean = substr($clean, 2);
        }

        if (strlen($clean) === 11 && str_starts_with($clean, '03')) {
            $clean = '92' . substr($clean, 1);
        } elseif (strlen($clean) === 10 && str_starts_with($clean, '3')) {
            $clean = '92' . $clean;
        }

        if (preg_match('/^923\d{9}$/', $clean)) {
            return $clean;
        }

        return null;
    }

    /**
     * WhatsApp API uses the same 923XXXXXXXXX format (no leading +).
     */
    public static function toInternational(?string $phone): ?string
    {
        return self::normalize($phone);
    }

    public static function format(?string $phone): ?string
    {
        $normalized = self::normalize($phone);
        if (! $normalized) {
            return $phone;
        }

        return substr($normalized, 0, 3) . ' ' . substr($normalized, 3, 3) . ' ' . substr($normalized, 6);
    }

    public static function isValid(?string $phone): bool
    {
        return self::normalize($phone) !== null;
    }

    /**
     * True when the login field should be treated as a phone (not staff email/username).
     */
    public static function looksLikePhone(string $value): bool
    {
        $trim = trim($value);
        if ($trim === '') {
            return false;
        }
        if (filter_var($trim, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $digits = preg_replace('/\D/', '', $trim);

        return strlen($digits) >= 10 || str_starts_with($trim, '+') || str_starts_with($trim, '03') || str_starts_with($trim, '92');
    }

    /**
     * Classify why normalize() failed (for import skip reporting).
     */
    public static function normalizeFailureReason(?string $phone): string
    {
        if ($phone === null || trim($phone) === '') {
            return 'empty_phone';
        }

        if (preg_match('/[^\d\s\-+().]/', $phone)) {
            return 'non_digit_chars';
        }

        $digits = preg_replace('/\D/', '', $phone);
        $len = strlen($digits);

        if ($len < 10) {
            return 'too_short';
        }
        if ($len > 15) {
            return 'too_long';
        }

        if (preg_match('/^923\d{9}$/', $digits)) {
            return 'other';
        }

        if (str_starts_with($digits, '03') && $len === 11) {
            return 'other';
        }

        if (str_starts_with($digits, '3') && $len === 10) {
            return 'other';
        }

        return 'wrong_prefix';
    }

    public static function mask(?string $phone): string
    {
        if (! $phone) {
            return '';
        }
        $d = preg_replace('/\D/', '', $phone);

        return strlen($d) >= 4
            ? substr($d, 0, 2) . '**-***-**' . substr($d, -2)
            : '****';
    }
}
