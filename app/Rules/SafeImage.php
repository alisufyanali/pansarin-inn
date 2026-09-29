<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * Image validation that does NOT depend on the php `fileinfo` extension.
 *
 * Laravel's built-in `image` / `mimes` rules call Symfony MimeTypes, which
 * throws a LogicException when fileinfo is missing (Hostinger shared hosting).
 * This rule instead checks:
 *   1. extension whitelist (client extension, lower-cased)
 *   2. real content: getimagesize() for raster images (core PHP, no fileinfo)
 *   3. SVG (only if whitelisted): must look like SVG and contain no script/handlers
 */
class SafeImage implements ValidationRule
{
    private const DEFAULT = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    /** @param string[] $extensions */
    public function __construct(private array $extensions = self::DEFAULT)
    {
        $this->extensions = array_map('strtolower', $extensions);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid()) {
            $fail('The :attribute must be a valid uploaded image.');
            return;
        }

        $ext = strtolower($value->getClientOriginalExtension());
        if ($ext === '' || ! in_array($ext, $this->extensions, true)) {
            $fail('The :attribute must be a file of type: ' . implode(', ', $this->extensions) . '.');
            return;
        }

        $path = $value->getRealPath();

        if ($ext === 'svg') {
            $head = (string) @file_get_contents($path, false, null, 0, 1024 * 512);
            if (stripos($head, '<svg') === false
                || preg_match('/<script|javascript:|\son[a-z]+\s*=/i', $head)) {
                $fail('The :attribute must be a safe SVG image.');
            }
            return;
        }

        if ($path === false || @getimagesize($path) === false) {
            $fail('The :attribute must be an image.');
        }
    }
}
