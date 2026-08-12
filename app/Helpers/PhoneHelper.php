<?php

namespace App\Helpers;

class PhoneHelper
{
    /**
     * Normalize phone number to consistent Pakistani format (03XXXXXXXXX)
     * 
     * Accepts:
     * - 03001234567
     * - +923001234567
     * - 923001234567
     * - 00923001234567
     * - +92-300-1234567 (with dashes/spaces)
     * 
     * Returns: 03001234567 (consistent local format)
     */
    public static function normalize(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        // Remove all non-numeric characters
        $clean = preg_replace('/[^0-9]/', '', $phone);

        // Empty after cleaning
        if (empty($clean)) {
            return null;
        }

        // Handle different formats
        // Case 1: Starts with 0092 (international with 00 prefix) → remove 0092, add 0
        if (str_starts_with($clean, '0092') && strlen($clean) === 14) {
            $clean = '0' . substr($clean, 4);
        }
        // Case 2: Starts with 92 (international without +) → remove 92, add 0
        elseif (str_starts_with($clean, '92') && strlen($clean) === 12) {
            $clean = '0' . substr($clean, 2);
        }
        // Case 3: Starts with 3 (missing leading 0) → add 0
        elseif (str_starts_with($clean, '3') && strlen($clean) === 10) {
            $clean = '0' . $clean;
        }
        // Case 4: Already in correct format 03XXXXXXXXX (11 digits starting with 0)
        elseif (str_starts_with($clean, '0') && strlen($clean) === 11) {
            // Already correct
        }
        // Case 5: Invalid format
        else {
            return null;
        }

        // Final validation: must be 03XXXXXXXXX (11 digits, starts with 03)
        if (strlen($clean) === 11 && str_starts_with($clean, '03')) {
            return $clean;
        }

        return null;
    }

    /**
     * Convert to E.164 international format for WhatsApp (923XXXXXXXXX without +)
     */
    public static function toInternational(?string $phone): ?string
    {
        $normalized = self::normalize($phone);
        
        if (!$normalized) {
            return null;
        }

        // Convert 03XXXXXXXXX → 923XXXXXXXXX
        if (str_starts_with($normalized, '0')) {
            return '92' . substr($normalized, 1);
        }

        return $normalized;
    }

    /**
     * Format for display (0300-1234567)
     */
    public static function format(?string $phone): ?string
    {
        $normalized = self::normalize($phone);
        
        if (!$normalized) {
            return $phone; // Return original if normalization fails
        }

        // Format as 0300-1234567
        if (strlen($normalized) === 11) {
            return substr($normalized, 0, 4) . '-' . substr($normalized, 4);
        }

        return $normalized;
    }

    /**
     * Validate Pakistani mobile format
     */
    public static function isValid(?string $phone): bool
    {
        return self::normalize($phone) !== null;
    }
}
