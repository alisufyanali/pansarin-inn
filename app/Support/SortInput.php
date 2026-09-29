<?php

namespace App\Support;

/**
 * Sanitises user-supplied sort parameters for DataTable endpoints.
 * Column names must look like plain identifiers (optionally table.column) —
 * anything else, e.g. JSON paths or expressions, falls back to the default.
 * Direction is always 'asc' or 'desc'.
 */
class SortInput
{
    public static function column(?string $value, string $default): string
    {
        return is_string($value) && preg_match('/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)?$/', $value)
            ? $value
            : $default;
    }

    public static function direction(?string $value, string $default = 'desc'): string
    {
        $value = strtolower((string) $value);

        return in_array($value, ['asc', 'desc'], true) ? $value : $default;
    }
}
